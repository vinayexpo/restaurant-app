import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { cartService } from '../services/cartService'
import { setCart, clearCart } from '../features/customer/cartSlice'

export function useCart() {
  const dispatch = useDispatch()
  const cartState = useSelector((state) => state.cart)

  const refresh = useCallback(async () => {
    const { data } = await cartService.get()
    dispatch(setCart(data.data))
    return data.data
  }, [dispatch])

  const addItem = useCallback(
    async (payload, restaurantName) => {
      try {
        const { data } = await cartService.addItem(payload)
        dispatch(setCart(data.data))
        toast.success('Added to cart')
        return data.data
      } catch (error) {
        if (error.response?.status !== 422) {
          toast.error('Could not add item to cart.')
        }
        throw error
      }
    },
    [dispatch]
  )

  const updateItem = useCallback(
    async (id, quantity) => {
      const { data } = await cartService.updateItem(id, { quantity })
      dispatch(setCart(data.data))
      return data.data
    },
    [dispatch]
  )

  const removeItem = useCallback(
    async (id) => {
      const { data } = await cartService.removeItem(id)
      dispatch(setCart(data.data))
      return data.data
    },
    [dispatch]
  )

  const clear = useCallback(async () => {
    await cartService.clear()
    dispatch(clearCart())
  }, [dispatch])

  return { ...cartState, refresh, addItem, updateItem, removeItem, clear }
}
