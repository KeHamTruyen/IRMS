import LoginHeroPanel from '../components/login/LoginHeroPanel'
import LoginAccessPanel from '../components/login/LoginAccessPanel'

function LoginPage(props) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-5 py-8 max-md:px-0 max-md:py-0">
      <section
        className="grid min-h-screen w-full overflow-hidden bg-white max-md:rounded-none md:min-h-[720px] md:max-w-[1120px] md:grid-cols-[1.05fr_0.95fr] md:rounded-3xl md:border md:border-[#d8e0e7] md:shadow-[0_18px_40px_rgba(30,41,59,0.08)]"
        aria-label="Đăng nhập IRMS"
      >
        <LoginHeroPanel />
        <LoginAccessPanel {...props} />
      </section>
    </main>
  )
}

export default LoginPage
