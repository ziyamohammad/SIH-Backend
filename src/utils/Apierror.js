class Apierror extends Error{
    constructor(
        statuscode,
        message="something went wrong",
        error=[],
        stack=""
    ){
        super(message)
        this.statuscode=statuscode
        this.data=null
        this.success=false
        this.error=error
        if(!stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(constructor,this.constructor)
        }
    }
}

export {Apierror}