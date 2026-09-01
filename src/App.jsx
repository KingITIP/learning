import { useState } from 'react'
import './App.css'

const initialItems = [
  { id: 1, kode: 'BRG-001', nama: 'Semen Portland 50kg',   kategori: 'Material',    jumlah: 120, satuan: 'Sak',   lokasi: 'Rak A1', harga: 65000  },
  { id: 2, kode: 'BRG-002', nama: 'Besi Beton 10mm',       kategori: 'Material',    jumlah: 250, satuan: 'Batang', lokasi: 'Rak A2', harga: 85000  },
  { id: 3, kode: 'BRG-003', nama: 'Cat Tembok Putih 5L',   kategori: 'Cat',         jumlah: 45,  satuan: 'Kaleng', lokasi: 'Rak B1', harga: 120000 },
  { id: 4, kode: 'BRG-004', nama: 'Pipa PVC 3/4 inch',     kategori: 'Pipa',        jumlah: 80,  satuan: 'Batang', lokasi: 'Rak C1', harga: 25000  },
  { id: 5, kode: 'BRG-005', nama: 'Kabel NYM 2x1.5mm 50m', kategori: 'Elektrikal',  jumlah: 30,  satuan: 'Roll',   lokasi: 'Rak D1', harga: 350000 },
]


const kategoriOptions = ['Material', 'Cat', 'Pipa', 'Elektrikal', 'Alat', 'Lainnya']
const satuanOptions   = ['Sak', 'Batang', 'Kaleng', 'Roll', 'Buah', 'Lembar', 'Kg', 'Liter', 'Pcs']

const emptyForm = {
  kode: '', nama: '', kategori: 'Material', jumlah: '', satuan: 'Pcs', lokasi: '', harga: ''
}

function App() {
  // --- State ---
  const [items, setItems]           = useState(initialItems)
  const [form, setForm]             = useState(emptyForm)
  const [editingId, setEditingId]   = useState(null)      // null = mode tambah, angka = mode edit
  const [search, setSearch]         = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)  // item yang akan dihapus (konfirmasi)
  const [toast, setToast]           = useState(null)       // pesan toast

  // --- Helper: ID berikutnya ---
  const nextId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1

  // --- Helper: Kode otomatis ---
  const generateKode = () => `BRG-${String(nextId).padStart(3, '0')}`

  // --- Helper: Toast ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // --- Handler: perubahan input form ---
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // --- Handler: buka modal tambah ---
  const handleOpenAdd = () => {
    setForm({ ...emptyForm, kode: generateKode() })
    setEditingId(null)
    document.getElementById('modal_form').showModal()
  }

  // --- Handler: buka modal edit ---
  const handleEdit = (item) => {
    setForm({
      kode:     item.kode,
      nama:     item.nama,
      kategori: item.kategori,
      jumlah:   item.jumlah,
      satuan:   item.satuan,
      lokasi:   item.lokasi,
      harga:    item.harga,
    })
    setEditingId(item.id)
    document.getElementById('modal_form').showModal()
  }

  // --- Handler: submit form (CREATE / UPDATE) ---
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validasi sederhana
    if (!form.nama || !form.jumlah || !form.lokasi || !form.harga) {
      showToast('Harap isi semua field yang wajib!', 'error')
      return
    }

    if (editingId !== null) {
      // UPDATE
      setItems(prev =>
        prev.map(item =>
          item.id === editingId
            ? { ...item, ...form, jumlah: Number(form.jumlah), harga: Number(form.harga) }
            : item
        )
      )
      showToast('Barang berhasil diperbarui!')
    } else {
      // CREATE
      const newItem = {
        id: nextId,
        ...form,
        jumlah: Number(form.jumlah),
        harga:  Number(form.harga),
      }
      setItems(prev => [...prev, newItem])
      showToast('Barang baru berhasil ditambahkan!')
    }

    document.getElementById('modal_form').close()
    setForm(emptyForm)
    setEditingId(null)
  }

  // --- Handler: konfirmasi hapus ---
  const handleDeleteConfirm = (item) => {
    setDeleteTarget(item)
    document.getElementById('modal_delete').showModal()
  }

  // --- Handler: hapus (DELETE) ---
  const handleDelete = () => {
    setItems(prev => prev.filter(item => item.id !== deleteTarget.id))
    showToast(`"${deleteTarget.nama}" berhasil dihapus!`, 'warning')
    setDeleteTarget(null)
    document.getElementById('modal_delete').close()
  }

  // --- Filter pencarian ---
  const filteredItems = items.filter(item =>
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    item.kode.toLowerCase().includes(search.toLowerCase()) ||
    item.kategori.toLowerCase().includes(search.toLowerCase()) ||
    item.lokasi.toLowerCase().includes(search.toLowerCase())
  )

  // --- Format rupiah ---
  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  // --- Statistik ringkasan ---
  const totalBarang  = items.length
  const totalStok    = items.reduce((acc, i) => acc + i.jumlah, 0)
  const totalNilai   = items.reduce((acc, i) => acc + (i.jumlah * i.harga), 0)
  const stokRendah   = items.filter(i => i.jumlah < 50).length

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-base-200" data-theme="dark">

      {/* ───── NAVBAR ───── */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="flex-1">
          <span className="text-xl font-bold px-4 flex items-center gap-2">
            Gudang<span className="text-primary">Ku</span>
          </span>
        </div>
        <div className="flex-none gap-2 pr-4">
          <div className="badge badge-primary badge-outline">{totalBarang} Item</div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">

        {/* ───── STAT CARDS ───── */}
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6 bg-base-100">
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="stat-title">Total Jenis Barang</div>
            <div className="stat-value text-primary">{totalBarang}</div>
            <div className="stat-desc">Terdaftar di gudang</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="stat-title">Total Stok</div>
            <div className="stat-value text-secondary">{totalStok.toLocaleString('id-ID')}</div>
            <div className="stat-desc">Unit keseluruhan</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-title">Total Nilai Inventaris</div>
            <div className="stat-value text-accent text-2xl">{formatRupiah(totalNilai)}</div>
            <div className="stat-desc">Estimasi nilai gudang</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-title">Stok Rendah</div>
            <div className="stat-value text-warning">{stokRendah}</div>
            <div className="stat-desc">Jumlah &lt; 50 unit</div>
          </div>
        </div>

        {/* ───── TOOLBAR: SEARCH + TAMBAH ───── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center justify-between">
          <label className="input input-bordered flex items-center gap-2 w-full sm:w-auto sm:min-w-80 bg-base-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70">
              <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              className="grow"
              placeholder="Cari nama, kode, kategori, lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button className="btn btn-primary gap-2 w-full sm:w-auto" onClick={handleOpenAdd}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Barang
          </button>
        </div>

        {/* ───── TABEL DATA ───── */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="bg-base-300">
                    <th className="text-center">#</th>
                    <th>Kode</th>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th className="text-center">Jumlah</th>
                    <th>Satuan</th>
                    <th>Lokasi</th>
                    <th className="text-right">Harga Satuan</th>
                    <th className="text-right">Subtotal</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-10 text-base-content/50">
                        <div className="flex flex-col items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 opacity-30">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                          </svg>
                          <span>Tidak ada barang ditemukan</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => (
                      <tr key={item.id} className="hover">
                        <td className="text-center font-mono text-sm opacity-50">{index + 1}</td>
                        <td>
                          <span className="badge badge-ghost badge-sm font-mono">{item.kode}</span>
                        </td>
                        <td className="font-semibold">{item.nama}</td>
                        <td>
                          <span className={`badge badge-sm ${
                            item.kategori === 'Material'   ? 'badge-primary' :
                            item.kategori === 'Cat'        ? 'badge-secondary' :
                            item.kategori === 'Pipa'       ? 'badge-accent' :
                            item.kategori === 'Elektrikal' ? 'badge-warning' :
                            item.kategori === 'Alat'       ? 'badge-info' :
                            'badge-ghost'
                          }`}>
                            {item.kategori}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`font-bold ${item.jumlah < 50 ? 'text-error' : 'text-success'}`}>
                            {item.jumlah.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td>{item.satuan}</td>
                        <td>
                          <span className="text-sm opacity-75">{item.lokasi}</span>
                        </td>
                        <td className="text-right font-mono text-sm">{formatRupiah(item.harga)}</td>
                        <td className="text-right font-mono text-sm font-semibold">
                          {formatRupiah(item.jumlah * item.harga)}
                        </td>
                        <td className="text-center">
                          <div className="flex gap-1 justify-center">
                            <button
                              className="btn btn-ghost btn-xs text-info tooltip"
                              data-tip="Edit"
                              onClick={() => handleEdit(item)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error tooltip"
                              data-tip="Hapus"
                              onClick={() => handleDeleteConfirm(item)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Footer tabel */}
            <div className="flex justify-between items-center p-4 bg-base-200/50 text-sm">
              <span className="opacity-70">
                Menampilkan {filteredItems.length} dari {items.length} barang
              </span>
              <span className="font-semibold">
                Total Nilai: {formatRupiah(filteredItems.reduce((acc, i) => acc + (i.jumlah * i.harga), 0))}
              </span>
            </div>
          </div>
        </div>

        {/* ───── FOOTER ───── */}
        <footer className="text-center text-sm opacity-50 py-6 mt-4">
          GudangKu — Showcase CRUD Pendataan Barang Gudang &bull; React + Tailwind CSS + DaisyUI
        </footer>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL: Form Tambah / Edit Barang                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      <dialog id="modal_form" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box w-11/12 max-w-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            {editingId !== null ? (
              <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-info"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> Edit Barang</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> Tambah Barang Baru</>
            )}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kode Barang */}
              <div className="form-control">
                <label className="label"><span className="label-text">Kode Barang</span></label>
                <input
                  type="text" name="kode" value={form.kode}
                  className="input input-bordered input-sm" readOnly
                />
                <label className="label"><span className="label-text-alt opacity-50">Otomatis</span></label>
              </div>

              {/* Nama Barang */}
              <div className="form-control">
                <label className="label"><span className="label-text">Nama Barang *</span></label>
                <input
                  type="text" name="nama" value={form.nama}
                  onChange={handleChange}
                  placeholder="Contoh: Semen Portland 50kg"
                  className="input input-bordered input-sm"
                  required
                />
              </div>

              {/* Kategori */}
              <div className="form-control">
                <label className="label"><span className="label-text">Kategori</span></label>
                <select name="kategori" value={form.kategori} onChange={handleChange} className="select select-bordered select-sm">
                  {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              {/* Jumlah */}
              <div className="form-control">
                <label className="label"><span className="label-text">Jumlah Stok *</span></label>
                <input
                  type="number" name="jumlah" value={form.jumlah}
                  onChange={handleChange}
                  placeholder="0" min="0"
                  className="input input-bordered input-sm"
                  required
                />
              </div>

              {/* Satuan */}
              <div className="form-control">
                <label className="label"><span className="label-text">Satuan</span></label>
                <select name="satuan" value={form.satuan} onChange={handleChange} className="select select-bordered select-sm">
                  {satuanOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Lokasi */}
              <div className="form-control">
                <label className="label"><span className="label-text">Lokasi Gudang *</span></label>
                <input
                  type="text" name="lokasi" value={form.lokasi}
                  onChange={handleChange}
                  placeholder="Contoh: Rak A1"
                  className="input input-bordered input-sm"
                  required
                />
              </div>

              {/* Harga */}
              <div className="form-control sm:col-span-2">
                <label className="label"><span className="label-text">Harga Satuan (Rp) *</span></label>
                <input
                  type="number" name="harga" value={form.harga}
                  onChange={handleChange}
                  placeholder="0" min="0"
                  className="input input-bordered input-sm"
                  required
                />
              </div>
            </div>

            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-ghost btn-sm">Batal</button>
              </form>
              <button type="submit" className={`btn btn-sm ${editingId !== null ? 'btn-info' : 'btn-primary'}`}>
                {editingId !== null ? ' Simpan Perubahan' : ' Tambah Barang'}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL: Konfirmasi Hapus                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <dialog id="modal_delete" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Konfirmasi Hapus
          </h3>
          {deleteTarget && (
            <div className="py-4">
              <p className="mb-3">Apakah Anda yakin ingin menghapus barang ini?</p>
              <div className="bg-base-200 rounded-lg p-4">
                <p className="font-semibold">{deleteTarget.nama}</p>
                <p className="text-sm opacity-70">Kode: {deleteTarget.kode} &bull; Stok: {deleteTarget.jumlah} {deleteTarget.satuan}</p>
              </div>
              <p className="text-sm text-error mt-3"> Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          )}
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost btn-sm">Batal</button>
            </form>
            <button className="btn btn-error btn-sm" onClick={handleDelete}> Ya, Hapus</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TOAST NOTIFICATION                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      {toast && (
        <div className="toast toast-top toast-end z-[100]">
          <div className={`alert ${
            toast.type === 'success' ? 'alert-success' :
            toast.type === 'error'   ? 'alert-error'   :
            toast.type === 'warning' ? 'alert-warning'  :
            'alert-info'
          } shadow-lg`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
