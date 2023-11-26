import { forwardRef, useState, type ReactNode } from 'react'
import { View } from 'react-native'
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet'
import { Button, Text } from '@ui-kitten/components'

import Counter from '../components/Counter'
import DateTimePicker from '../components/DateTimePicker'

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

export const InputDateTimeModal = forwardRef<
  BottomSheetModal,
  { title: string; onConfirm: (value: Date) => void }
>(function InputDateTimeModal({ title, onConfirm }, ref) {
  const [value, setValue] = useState<Date>(new Date())

  return (
    <InputModal ref={ref} height="55%">
      <Text category="h5">{title}</Text>
      <DateTimePicker date={value} setDate={setValue} />
      <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
        <Button
          size="giant"
          style={{ borderRadius: 100 }}
          onPress={() => {
            onConfirm(value)
            ref.current?.dismiss()
          }}
        >
          確定
        </Button>
      </View>
    </InputModal>
  )
})

export const InputCounterModal = forwardRef<
  BottomSheetModal,
  { title: string; onConfirm: (value: Date) => void }
>(function InputCounterModal({ title, onConfirm }, ref) {
  const [value, setValue] = useState<number>(0)

  return (
    <InputModal ref={ref} height="40%">
      <Text category="h5">{title}</Text>
      <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
        <Counter value={value} onValueChange={setValue} />
        <Button
          size="giant"
          style={{ borderRadius: 100 }}
          onPress={() => {
            onConfirm(value)
            ref.current?.dismiss()
          }}
        >
          確定
        </Button>
      </View>
    </InputModal>
  )
})
