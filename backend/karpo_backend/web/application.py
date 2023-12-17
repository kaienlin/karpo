import time
from importlib import metadata
from pathlib import Path
from random import uniform

from asyncpg.exceptions import SerializationError
from fastapi import FastAPI, Request
from fastapi.responses import UJSONResponse
from fastapi.staticfiles import StaticFiles
from loguru import logger
from sqlalchemy.exc import DBAPIError
from starlette.middleware.base import BaseHTTPMiddleware

from karpo_backend.logging import configure_logging
from karpo_backend.web.api.router import api_router
from karpo_backend.web.lifetime import register_shutdown_event, register_startup_event

APP_ROOT = Path(__file__).parent.parent


class RetryTxnMiddleware:
    def _retry_exponential_backoff(
        self, retry_count: int, max_backoff: int = 0
    ) -> None:
        sleep_secs = uniform(0, min(max_backoff, 0.1 * (2**retry_count)))
        time.sleep(sleep_secs)

    async def __call__(self, request: Request, call_next):
        retry_cnt = 0
        max_retries = 3
        while True:
            try:
                result = await call_next(request)
                return result
            except DBAPIError as e:
                if retry_cnt >= max_retries:
                    raise
                do_retry = False
                if isinstance(e.orig, SerializationError):
                    do_retry = True
                if do_retry:
                    logger.warning("transaction failed, retrying...")
                    retry_count += 1
                    self._retry_exponential_backoff(retry_cnt)


def get_app() -> FastAPI:
    """
    Get FastAPI application.

    This is the main constructor of an application.

    :return: application.
    """
    configure_logging()
    app = FastAPI(
        title="karpo_backend",
        version=metadata.version("karpo_backend"),
        docs_url=None,
        redoc_url=None,
        openapi_url="/api/openapi.json",
        default_response_class=UJSONResponse,
    )

    # Adds startup and shutdown events.
    register_startup_event(app)
    register_shutdown_event(app)

    # Main router for the API.
    app.include_router(router=api_router, prefix="/api")
    # Adds static directory.
    # This directory is used to access swagger files.
    app.mount(
        "/static",
        StaticFiles(directory=APP_ROOT / "static"),
        name="static",
    )

    app.add_middleware(BaseHTTPMiddleware, dispatch=RetryTxnMiddleware())

    return app
