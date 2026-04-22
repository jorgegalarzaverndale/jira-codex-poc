"use client";

type ButtonProps = {
  label: string;
};

export function Button({ label }: ButtonProps) {
  return (
    <div
      onClick={() => console.log("Button clicked")}
      className="bg-slate-500 text-white text-sm font-semibold rounded-md px-2 py-1 cursor-pointer"
    >
      {label}
    </div>
  );
}
