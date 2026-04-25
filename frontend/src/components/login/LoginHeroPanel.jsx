function LoginHeroPanel() {
  return (
    <section className="flex flex-col justify-between bg-[#2d7871] p-10 text-[#effcfb] max-lg:p-6">
      <div>
        <span className="inline-block text-xs font-bold uppercase tracking-normal text-[#effcfb]">
          IRMS Pro
        </span>
        <h1 className="mt-3 text-[clamp(2.2rem,3vw,3.6rem)] leading-[1.02] tracking-normal">
          Điều phối nhẹ nhàng cho vận hành phòng ăn và bếp.
        </h1>
        <p className="mt-4 max-w-[34rem] text-base leading-7 text-white/85">
          Tối giản, ổn định và sẵn sàng cho truy cập theo vai trò ở quầy quản trị,
          khu phục vụ, bếp và thu ngân.
        </p>
      </div>

      <div
        className="relative my-7 min-h-[340px] overflow-hidden rounded-[20px] border border-white/15 bg-[rgba(9,43,40,0.2)]"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-[16%] h-[52%] w-[38%] -translate-x-1/2 border-[12px] border-[rgba(191,248,241,0.28)] bg-[rgba(175,232,225,0.12)] before:absolute before:inset-y-0 before:left-1/2 before:w-[2px] before:bg-[rgba(191,248,241,0.22)] before:content-[''] after:absolute after:left-0 after:right-0 after:top-[52%] after:h-[2px] after:bg-[rgba(191,248,241,0.22)] after:content-['']">
          <div className="absolute -bottom-[16%] -left-[16%] h-4 w-[132%] bg-[rgba(191,248,241,0.25)]" />
        </div>
        <div className="absolute bottom-[18%] left-[22%] right-[22%] h-[18px] bg-[rgba(11,30,29,0.4)] before:absolute before:bottom-[-84px] before:left-[16%] before:h-[84px] before:w-3 before:bg-[rgba(11,30,29,0.4)] before:content-[''] after:absolute after:bottom-[-84px] after:right-[16%] after:h-[84px] after:w-3 after:bg-[rgba(11,30,29,0.4)] after:content-['']" />
        <div className="absolute bottom-[18%] left-[8%] h-[110px] w-[68px] rounded-[34px_34px_12px_12px] bg-[rgba(191,248,241,0.16)]" />
        <div className="absolute bottom-[18%] right-[8%] h-[110px] w-[68px] rounded-[34px_34px_12px_12px] bg-[rgba(191,248,241,0.16)]" />
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="w-fit rounded-full bg-white/15 px-3.5 py-2.5 font-semibold text-[#effcfb]">
          Bếp sẵn sàng
        </div>
        <p className="max-w-[34rem] text-base leading-7 text-white/85">
          Dữ liệu dự phòng đã đồng bộ cho dashboard, đơn hàng, bàn và thanh toán.
        </p>
      </div>
    </section>
  )
}

export default LoginHeroPanel
