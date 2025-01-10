
import { StagePanel } from "./components";

export default function ServiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className='flex flex-col grow h-full relative'>
      <StagePanel/>
      <div className='flex flex-col grow h-full '>
        {children}
      </div>
    </div>
  );
}