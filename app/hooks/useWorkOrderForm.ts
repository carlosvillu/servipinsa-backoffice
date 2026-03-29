import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSubmit, useNavigation } from 'react-router'
import {
  workOrderFormSchema,
  type WorkOrderFormData,
} from '~/schemas/workOrder'

export function useWorkOrderForm() {
  const submit = useSubmit()
  const navigation = useNavigation()

  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderFormSchema) as never,
    defaultValues: {
      client: '',
      address: '',
      carNumber: '',
      driverOut: '',
      driverReturn: '',
      tasks: [{ description: '', startTime: '', endTime: '' }],
      labor: [{ technicianName: '', entryTime: '', exitTime: '' }],
      materials: [],
    },
  })

  const tasksFieldArray = useFieldArray({
    control: form.control,
    name: 'tasks',
  })

  const laborFieldArray = useFieldArray({
    control: form.control,
    name: 'labor',
  })

  const materialsFieldArray = useFieldArray({
    control: form.control,
    name: 'materials',
  })

  function onSubmit(data: WorkOrderFormData) {
    const formData = new FormData()
    formData.set('_json', JSON.stringify(data))
    submit(formData, { method: 'POST' })
  }

  return {
    form,
    tasksFieldArray,
    laborFieldArray,
    materialsFieldArray,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: navigation.state !== 'idle',
  }
}
