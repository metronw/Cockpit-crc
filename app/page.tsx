import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home(){
  const cookieStore = cookies()
  const token = cookieStore.get('logged_user');
  if(token){
    const user = JSON.parse(token.value)

    if(user.role==1){
      redirect('/agent/'+user.id)
    }
  }

  return null
  
  

}