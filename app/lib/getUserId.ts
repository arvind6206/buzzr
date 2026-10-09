import {jwtVerify} from 'jose'
export async function getUserId(request: Request): 
Promise<string | null> {
    //get the auth header
    const authHeader = request.headers.get("authorization")


    if(!authHeader?.startsWith("Bearer ")){
        return null
    }

    const token = authHeader.slice(7)


   try {
     //extract jwt
    const secret = process.env.JWT_SECRET
    if(!secret){
        throw new Error("JWT_SECRET is missing")
    }

    const secretKey = new TextEncoder().encode(secret)

    //verify token
    const {payload} = await jwtVerify(token, secretKey)


    if(typeof payload.id !== "string"){
        return null
    }



    return payload.id;
   } catch (error) {
    return null;
   }
}