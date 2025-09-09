import mongoose from 'mongoose'

const connectdb = async()=>{
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_NAME}`)
        console.log(`database connected \n dbhost = ${connectioninstance.connection.host}`)
    }
    catch (error) {
        console.log("error",error)
    }
}
export {connectdb}