import Order from '../schema/TotalOrderDB.js'

// 심부름 만들기
export async function create(data) {
    try {
        const newOrder = new Order(data)
        return await newOrder.save()
    } catch (error) {
        console.error('Error creating order:', error)
        throw error
    }
}
