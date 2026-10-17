import QRCode from "react-qr-code";

export function Qr({ value, size = 96 }: { value: string; size?: number }) {
  return (
    <div
      className="rounded-md bg-white p-2"
      style={{ width: size + 16, height: size + 16 }}
    >
      <QRCode
        value={value}
        size={size}
        bgColor="#FFFFFF"
        fgColor="#1D2923"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
