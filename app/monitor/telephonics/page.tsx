import { RealTimeProvider } from "./provider";
import { RealTimeTables } from "./components";

export default function RealTimePage() {
  return (
    <RealTimeProvider>
      <div className="flex flex-col p-2">
        <RealTimeTables />
      </div>
    </RealTimeProvider>
  );
}
