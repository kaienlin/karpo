import { exec } from 'child_process'
import { expect } from 'detox'

describe('HomeScreen', () => {
  beforeAll(async () => {
    await device.launchApp({
      languageAndLocale: {
        language: 'zh-TW',
        locale: 'zh-TW'
      },
      permissions: {
        location: 'always'
      }
    })

    if (device.getPlatform() === 'ios') {
      exec(
        `applesimutils --byId ${device.id} --setLocation "[25.017089003707316, 121.54544438688791]"`
      )
    }
  })

  // beforeEach(async () => {
  //   await device.reloadReactNative()
  // })

  it('should have welcome screen', async () => {
    await expect(element(by.text('發起共乘'))).toBeVisible()
    await expect(element(by.text('尋找共乘'))).toBeVisible()
    await expect(element(by.text('要去哪裡？'))).toBeVisible()
  })

  it('should show "尋找共乘" screen after click', async () => {
    await element(by.text('要去哪裡？')).tap()

    await expect(element(by.type('AIRGoogleMap'))).toBeVisible()

    await element(by.text('上車地點')).tap()
    await element(by.text('在地圖上設定地點')).tap()

    await element(by.type('AIRGoogleMap')).swipe('up', 'slow', 0.1)
    await expect(element(by.id('@searchWaypoint/input'))).toHaveText('男三舍')
    await element(by.text('完成')).tap()

    await element(by.text('下車地點')).tap()
    await element(by.id('@searchWaypoint/input')).replaceText('台北轉運站')
    await element(by.text('台北轉運站')).atIndex(1).tap()

    await element(by.text('發布行程')).tap()
  })
})
