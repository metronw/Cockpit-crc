import Image from "next/image";
import Link from "next/link"

export default function Login() {
  return (
    <div className="flex align-items-center items-center justify-center justify-items-center bg-primary min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className=""
          src="/img/logometro.svg"
          alt="Metro logo"
          width={180}
          height={38}
          priority
        />

        <div className="flex flex-col">
          <input className="m-2 p-2 rounded" type="text" placeholder="Email"></input>
          <input className="m-2 p-2 rounded" type="text" placeholder="Senha"></input>
          <Link className="m-2 p-2 rounded bg-white text-black justify-center flex" href="/agent" >Entrar</Link>
          <button className="m-2 p-2 rounded bg-black " >Entrar com Microsoft</button>
        </div>
        
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
