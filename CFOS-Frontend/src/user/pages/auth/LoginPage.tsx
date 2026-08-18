import { LoginForm } from "@user/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4">
      <div className="flex aspect-[4/2.5] min-h-[500px] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl md:flex-row">
        <div
          className="relative h-64 w-full bg-cover bg-center md:h-auto md:w-1/2"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000')`,
          }}
        >
          <div className="absolute inset-0 bg-black/10 md:hidden" />
          <div className="absolute right-0 top-0 hidden h-full w-16 translate-x-8 rounded-l-[100%] bg-white md:block" />
        </div>

        <div className="relative z-10 flex w-full items-center justify-center bg-white p-6 md:w-1/2">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
