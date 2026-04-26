function LoginHeroPanel() {
  return (
    <section className="flex flex-col justify-between bg-[#2d7871] p-8 text-[#effcfb] md:p-7 lg:p-10">
      <div>
        <span className="inline-block text-xs font-bold uppercase tracking-normal text-[#effcfb]">
          IRMS
        </span>
        <h1 className="mt-3 text-[clamp(2.2rem,3vw,3.6rem)] leading-[1.02] tracking-normal">
          Điều phối nhẹ nhàng cho vận hành nhà hàng!
        </h1>
        <p className="mt-4 max-w-136 text-base leading-7 text-white/85">
          Tối giản, ổn định và dễ sử dụng - giải pháp quản lý toàn diện cho nhà hàng.
        </p>
      </div>
      <div className="flex flex-col mt-8 h-full w-full justify-center md:mt-6">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Barbieri_-_ViaSophia25668.jpg/1280px-Barbieri_-_ViaSophia25668.jpg"
          alt="Hình minh họa đăng nhập IRMS"
          className="mx-auto w-full max-w-480px object-contain rounded-xl"
        />
      </div>
    </section>
  )
}

export default LoginHeroPanel
