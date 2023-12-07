import { forwardRef, useRef, useState, type ReactNode } from 'react'
import { View } from 'react-native'
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet'
import { Button, Text } from '@ui-kitten/components'

import Counter from '~/components/Counter'
import DateTimePicker from '~/components/DateTimePicker'

export const InputModal = forwardRef<BottomSheetModal, { height: string; children?: ReactNode }>(
  function InputModal(props, ref) {
    return (
      <BottomSheetModal
        ref={ref}
        index={1}
        snapPoints={[props.height, props.height]}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
        handleIndicatorStyle={{ display: 'none' }}
      >
        <View
          style={{
            flex: 1,
            paddingVertical: 20,
            paddingHorizontal: 40,
            gap: 20
          }}
        >
          {props.children}
        </View>
      </BottomSheetModal>
    )
  }
)

interface ControlledInput<Data> {
  value: Data | null
  onChange: (value: Data) => void
}

interface InputModalInstanceProps<Data> extends ControlledInput<Data> {
  title: string
  renderTriggerComponent: ({
    onOpen,
    value
  }: {
    onOpen: () => void
    value: Data | null
  }) => React.ReactNode
}

export const InputTime = ({
  title,
  renderTriggerComponent,
  value,
  onChange
}: InputModalInstanceProps<Date>) => {
  const modalRef = useRef<BottomSheetModal>(null)
  const [tempValue, setTempValue] = useState<Date>(value ?? new Date())

  const onOpen = () => {
    modalRef.current?.present()
  }
  const onClose = () => {
    modalRef.current?.dismiss()
  }

  return (
    <>
      {renderTriggerComponent({ onOpen, value })}

      <InputModal ref={modalRef} height="55%">
        <Text category="h5">{title}</Text>
        <DateTimePicker date={tempValue} setDate={setTempValue} />
        <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
          <Button
            size="giant"
            style={{ borderRadius: 100 }}
            onPress={() => {
              onClose()
              onChange(tempValue)
            }}
          >
            確定
          </Button>
        </View>
      </InputModal>
    </>
  )
}

export const InputCounter = ({
  title,
  renderTriggerComponent,
  value,
  onChange
}: InputModalInstanceProps<number>) => {
  const modalRef = useRef<BottomSheetModal>(null)
  const [tempValue, setTempValue] = useState<number>(value ?? 0)

  const onOpen = () => {
    modalRef.current?.present()
  }
  const onClose = () => {
    modalRef.current?.dismiss()
  }

  return (
    <>
      {renderTriggerComponent({ onOpen, value })}

      <InputModal ref={modalRef} height="40%">
        <Text category="h5">{title}</Text>
        <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
          <Counter value={tempValue} onValueChange={setTempValue} />
          <Button
            size="giant"
            style={{ borderRadius: 100 }}
            onPress={() => {
              onClose()
              onChange(tempValue)
            }}
          >
            確定
          </Button>
        </View>
      </InputModal>
    </>
  )
}
