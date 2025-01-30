import { RealTimeProvider } from "./provider";
import { RealTimeTables } from "./components";

export default function RealTimePage() {
  return (
    <RealTimeProvider>
      <div className="flex flex-col md:flex-row p-2">
        <div className="flex-1">
          <RealTimeTables />
        </div>
      </div>
    </RealTimeProvider>
  );
}
