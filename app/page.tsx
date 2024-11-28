import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/authOptions";
import { use } from "react";

export default function Home(){
  const session = use(getServerSession(authOptions));
  if(session){

    redirect('/agent/'+session.user.id)
    // if(session.user.role==1){
    // }
  }

  return null

}