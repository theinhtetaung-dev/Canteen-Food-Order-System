import { RegisterForm } from "@furniture/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f4f6f0] p-4 md:p-10">
      <div className="flex min-h-[600px] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl md:flex-row">
        <div className="relative h-64 w-full overflow-hidden bg-[#fbfbfa] md:h-auto md:w-[50%]">
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-700"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1200&auto=format&fit=crop')`,
            }}
          />
          <div className="absolute -right-1 top-0 hidden h-full w-28 md:block">
            <svg
              className="h-full w-full fill-white"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M100,0 L100,100 C60,95 30,65 70,50 C110,35 70,5 100,0 Z" />
            </svg>
          </div>
          <div className="absolute -bottom-1 left-0 block h-16 w-full scale-y-[-1] md:hidden">
            <svg
              className="h-full w-full fill-white"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M0,0 C30,30 70,30 100,0 L100,0 L0,0 Z" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 flex w-full items-center justify-center bg-white p-6 md:w-[50%] md:p-12">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
