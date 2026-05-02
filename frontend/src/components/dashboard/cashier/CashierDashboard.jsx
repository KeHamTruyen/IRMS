import { useMemo, useState } from 'react'
import { cashierApi } from '../../../services/cashierApi'
import { formatCurrency } from '../admin/utils'

const paymentMethods = [
  { code: 'CASH', label: 'Tiền mặt' },
  { code: 'CREDIT_CARD', label: 'Thẻ ngân hàng' },
  { code: 'DIGITAL_WALLET', label: 'Ví điện tử' },
  { code: 'BANK_TRANSFER', label: 'Chuyển khoản' },
]

function CashierDashboard({ dashboard, onSignOut }) {
  const [bills, setBills] = useState(dashboard.bills ?? [])
  const [selectedBillId, setSelectedBillId] = useState(bills.find((bill) => bill.status !== 'PAID')?.id ?? bills[0]?.id)
  const [method, setMethod] = useState('CASH')
  const [amount, setAmount] = useState('')
  const [tipAmount, setTipAmount] = useState('')
  const [splitParts, setSplitParts] = useState(2)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const selectedBill = useMemo(
    () => bills.find((bill) => bill.id === selectedBillId) ?? bills[0],
    [bills, selectedBillId]
  )

  const pendingBills = bills.filter((bill) => bill.status !== 'PAID')
  const paidToday = bills.filter((bill) => bill.status === 'PAID')
  const paidTotal = paidToday.reduce((sum, bill) => sum + Number(bill.amountPaid || bill.totalAmount || 0), 0)
  const amountPaid = Number(selectedBill?.amountPaid || 0)
  const remainingDue = Number(selectedBill?.remainingDue ?? selectedBill?.totalAmount ?? 0)
  const hasPayments = (selectedBill?.payments ?? []).some((payment) => payment.status === 'COMPLETED')

  const setFullAmount = () => {
    setAmount(remainingDue > 0 ? String(remainingDue) : '')
  }

  const setSplitAmount = (parts = splitParts) => {
    const normalizedParts = Math.max(2, Number(parts) || 2)
    setSplitParts(normalizedParts)
    if (remainingDue <= 0) {
      setAmount('')
      return
    }

    const billTotal = Number(selectedBill?.totalAmount || remainingDue || 0)
    const share = Math.ceil((billTotal / normalizedParts) * 100) / 100
    setAmount(String(Math.min(share, remainingDue)))
  }

  const pay = async () => {
    if (!selectedBill || selectedBill.status === 'PAID') return

    setBusy(true)
    setMessage('')
    try {
      const value = Number(amount || remainingDue || selectedBill.totalAmount)
      const updated = await cashierApi.processPayment(selectedBill.id, {
        amount: value,
        paymentMethod: method,
        tipAmount: !hasPayments && tipAmount ? Number(tipAmount) : undefined,
      })

      setBills((current) => current.map((bill) => (bill.id === updated.id ? { ...bill, ...updated } : bill)))
      setAmount('')
      setTipAmount('')
      setMessage('Thanh toán đã được ghi nhận.')
    } catch (error) {
      setMessage(error.message ?? 'Không thể xử lý thanh toán.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
        <header className="flex flex-col gap-4 rounded-[24px] border border-[#d8e0e7] bg-white p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0d9488]">Dashboard thu ngân</p>
            <h1 className="mt-2 text-3xl font-bold text-[#16202a]">Hóa đơn và thanh toán</h1>
            <p className="mt-2 text-sm text-[#62707f]">{dashboard.snapshotTime}</p>
          </div>
          <button className="rounded-[14px] border border-[#d8e0e7] bg-white px-4 py-3 font-semibold text-[#16202a]" onClick={onSignOut}>Đăng xuất</button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[18px] border border-[#d8e0e7] bg-white p-5">
            <div className="text-sm text-[#62707f]">Hóa đơn chờ thu</div>
            <div className="mt-3 text-3xl font-bold text-[#16202a]">{pendingBills.length}</div>
          </article>
          <article className="rounded-[18px] border border-[#d8e0e7] bg-white p-5">
            <div className="text-sm text-[#62707f]">Đã thanh toán</div>
            <div className="mt-3 text-3xl font-bold text-[#16202a]">{paidToday.length}</div>
          </article>
          <article className="rounded-[18px] border border-[#d8e0e7] bg-white p-5">
            <div className="text-sm text-[#62707f]">Tổng đã thu</div>
            <div className="mt-3 text-3xl font-bold text-[#2d7871]">{formatCurrency(paidTotal)}</div>
          </article>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[24px] border border-[#d8e0e7] bg-white p-5">
            <h2 className="text-xl font-semibold text-[#16202a]">Danh sách hóa đơn</h2>
            <div className="mt-4 space-y-3">
              {bills.map((bill) => (
                <button
                  key={bill.id}
                  type="button"
                  onClick={() => setSelectedBillId(bill.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${selectedBill?.id === bill.id ? 'border-[#0d9488] bg-[#effaf8]' : 'border-[#e7edf2] bg-white'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[#16202a]">{bill.billNumber}</div>
                      <div className="text-sm text-[#62707f]">Order #{bill.orderId} · {bill.orderTypeLabel}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${bill.status === 'PAID' ? 'bg-[#eef9f2] text-[#2f7a52]' : 'bg-[#fff7ed] text-[#b45309]'}`}>
                      {bill.status}
                    </span>
                  </div>
                  <div className="mt-3 font-semibold text-[#2d7871]">{formatCurrency(bill.remainingDue || bill.totalAmount)}</div>
                  {bill.status === 'PARTIALLY_PAID' && (
                    <div className="mt-1 text-xs font-semibold text-[#0d9488]">Đã thu một phần</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#d8e0e7] bg-white p-6">
            {selectedBill ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#16202a]">{selectedBill.billNumber}</h2>
                    <p className="mt-1 text-sm text-[#62707f]">Bàn {selectedBill.table?.tableNumber ?? 'N/A'} · Order #{selectedBill.orderId}</p>
                  </div>
                  <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-sm font-semibold text-[#16202a]">{selectedBill.status}</span>
                </div>

                <div className="mt-6 space-y-3 rounded-2xl bg-[#f8fafc] p-4 text-sm">
                  <div className="flex justify-between"><span>Tạm tính</span><strong>{formatCurrency(selectedBill.subtotal)}</strong></div>
                  <div className="flex justify-between"><span>Thuế</span><strong>{formatCurrency(selectedBill.tax)}</strong></div>
                  <div className="flex justify-between"><span>Phí dịch vụ</span><strong>{formatCurrency(selectedBill.serviceCharge)}</strong></div>
                  <div className="flex justify-between"><span>Giảm giá</span><strong>-{formatCurrency(selectedBill.discount)}</strong></div>
                  <div className="flex justify-between"><span>Tip</span><strong>{formatCurrency(selectedBill.tipAmount)}</strong></div>
                  <div className="flex justify-between"><span>Tổng hóa đơn</span><strong>{formatCurrency(selectedBill.totalAmount)}</strong></div>
                  <div className="flex justify-between"><span>Đã thu</span><strong>{formatCurrency(amountPaid)}</strong></div>
                  <div className="border-t border-[#d8e0e7] pt-3 flex justify-between text-lg"><span>Còn phải thu</span><strong>{formatCurrency(remainingDue)}</strong></div>
                </div>

                {selectedBill.status !== 'PAID' && (
                  <div className="mt-6 grid gap-3">
                    <div>
                      <div className="mb-2 text-sm font-semibold text-[#16202a]">Split bill / thu từng phần</div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <button type="button" onClick={setFullAmount} className="rounded-2xl border border-[#d8e0e7] px-3 py-2 text-sm font-semibold text-[#16202a]">Thu toàn bộ</button>
                        {[2, 3, 4].map((parts) => (
                          <button key={parts} type="button" onClick={() => setSplitAmount(parts)} className="rounded-2xl border border-[#d8e0e7] px-3 py-2 text-sm font-semibold text-[#16202a]">
                            Chia {parts}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input
                          className="w-28 rounded-2xl border border-[#d8e0e7] px-4 py-3"
                          type="number"
                          min="2"
                          step="1"
                          value={splitParts}
                          onChange={(event) => setSplitParts(event.target.value)}
                          aria-label="Số phần chia bill"
                        />
                        <button type="button" onClick={() => setSplitAmount(splitParts)} className="rounded-2xl border border-[#0d9488] px-4 py-3 text-sm font-bold text-[#0d9488]">
                          Áp dụng chia phần
                        </button>
                      </div>
                    </div>
                    <select className="rounded-2xl border border-[#d8e0e7] px-4 py-3" value={method} onChange={(event) => setMethod(event.target.value)}>
                      {paymentMethods.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
                    </select>
                    <input className="rounded-2xl border border-[#d8e0e7] px-4 py-3" type="number" min="0.01" max={remainingDue} step="0.01" placeholder={`Số tiền cần thu (${remainingDue})`} value={amount} onChange={(event) => setAmount(event.target.value)} />
                    <input className="rounded-2xl border border-[#d8e0e7] px-4 py-3 disabled:bg-[#eef2f6]" type="number" min="0" step="0.01" placeholder="Tip trước lần thanh toán đầu tiên" value={tipAmount} onChange={(event) => setTipAmount(event.target.value)} disabled={hasPayments} />
                    <button disabled={busy} onClick={pay} className="rounded-2xl bg-[#0d9488] px-5 py-3 font-bold text-white disabled:opacity-60">
                      {busy ? 'Đang xử lý...' : 'Ghi nhận khoản thu'}
                    </button>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-base font-semibold text-[#16202a]">Lịch sử thanh toán</h3>
                  <div className="mt-3 space-y-2">
                    {(selectedBill.payments ?? []).length > 0 ? (
                      selectedBill.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between rounded-2xl border border-[#e7edf2] px-4 py-3 text-sm">
                          <div>
                            <div className="font-semibold text-[#16202a]">{payment.paymentMethod}</div>
                            <div className="text-[#62707f]">{payment.status}</div>
                          </div>
                          <strong className="text-[#2d7871]">{formatCurrency(payment.amount)}</strong>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl bg-[#f8fafc] p-3 text-sm text-[#62707f]">Chưa có khoản thanh toán nào.</p>
                    )}
                  </div>
                </div>

                {message && <p className="mt-4 rounded-2xl bg-[#f8fafc] p-3 text-sm text-[#62707f]">{message}</p>}
              </>
            ) : <p className="text-sm text-[#62707f]">Chưa có hóa đơn.</p>}
          </div>
        </section>
      </section>
    </main>
  )
}

export default CashierDashboard
