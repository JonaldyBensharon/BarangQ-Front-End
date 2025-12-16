import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Login.css";
import Popup from "../components/Popup";
import api from "../components/api";

export default function Login({onLogin}) {
    const Navigate = useNavigate();
    
    const [activePanel, setActivePanel] = useState("login");

    const [loginData, setLoginData] = useState({ 
        username: "", 
        password: "" 
    });

    const [registerData, setRegisterData] = useState({ 
        username: "", 
        nama_toko: "", 
        password: "" 
    });

    const [recoveryData, setRecoveryData] = useState({ 
        username: "", 
        pin: "" 
    });

    const [resetData, setResetData] = useState({ 
        password: "" });
    
    const [confirmPassword, setConfirmPassword] = useState({
        confirmPass: ""});

    const [errors, setErrors] = useState({});

    const [recoveryUser, setRecoveryUser] = useState(null);

    const resetAllForms = () => {
        setLoginData({ username: "", password: "" });
        setRegisterData({ username: "", nama_toko: "", password: "" });
        setRecoveryData({ username: "", pin: "" });
        setResetData({ password: "" });
    };

    const switchPanel = (panel) => {
        setErrors({});
        resetAllForms();
        setActivePanel(panel);
    };

    const clearFieldError = (field) => {
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        onClose: null,
        withCopy: false,
        copyText: ""
    });

    const showPopup = (options) => {
        setPopup({
            show: true,
            message: options.message,
            onClose: options.onClose || null,
            withCopy: options.withCopy || false,
            copyText: options.copyText || ""
        });
    };

    const closePopup = () => {
        setPopup((prev) => {
            if (prev.onClose) prev.onClose();
            return { 
            show: false,
            message: "",
            onClose: null,
            withCopy: false,
            copyText: "" 
        };
        });
    };

    const validateLogin = () => {
        const err = {};
        if (!loginData.username) err["login-username"] = "Nama pengguna wajib diisi";

        if (!loginData.password) err["login-password"] = "Kata sandi wajib diisi";
        else if (loginData.password.length < 5)
            err["login-password"] = "Kata sandi minimal terdiri dari 5 karakter";
        setErrors(err);

        return Object.keys(err).length === 0;
    };

    const validateRegister = () => {
        const err = {};
        if (!registerData.username) err["register-username"] = "Nama pengguna wajib diisi";

        if (!registerData.nama_toko) err["register-namaToko"] = "Nama toko wajib diisi";

        if (!registerData.password) err["register-password"] = "Kata sandi wajib diisi";
        else if (registerData.password.length < 5)
            err["register-password"] = "Kata sandi minimal terdiri dari 5 karakter";
        setErrors(err);

        return Object.keys(err).length === 0;
    };

    const validateRecovery = () => {
        const err = {};
        if (!recoveryData.username.trim()) err["lupa-username"] = "Nama pengguna wajib diisi";

        if (!recoveryData.pin) err["lupa-pin"] = "PIN pemulihan wajib diisi";
        else if (recoveryData.pin.length < 4)
            err["lupa-pin"] = "PIN pemulihan minimal terdiri dari 4 digit";
        setErrors(err);

        return Object.keys(err).length === 0;
    };

    const validateReset = () => {
        const err = {};
        if (!resetData.password) err["reset-password"] = "Kata sandi wajib diisi";
        else if (resetData.password.length < 5)
            err["reset-password"] = "Kata sandi minimal terdiri dari 5 karakter";

        if (!confirmPassword.confirmPass) {
            err["reset-confirm"] = "Konfirmasi kata sandi wajib diisi.";
        } else if (resetData.password !== confirmPassword.confirmPass) {
            err["reset-confirm"] = "Konfirmasi kata sandi tidak cocok.";
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateLogin()) return;

        try {
            const response = await api.post('/users/login', {
                username: loginData.username,
                password: loginData.password
            });

            const { user, message, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));

            showPopup({message:`Selamat datang, ${user.username}`,
                onClose: () => {
                    onLogin(user);
                    Navigate("/", { replace: true });
            }});
        }catch (err) {
            const errorMessage = err.response?.data?.error || 'Terjadi kesalahan server';
            showPopup({ message: errorMessage });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateRegister()) return;

        try {
            console.log("Register data:", registerData);

            const response = await api.post('/users/register', {
                username: registerData.username,
                password: registerData.password,
                store_name: registerData.nama_toko
            });

            const { user, message } = response.data;
            const pin = user.pin;
            
            showPopup({
                message: (
                    <>
                    <p>Registrasi berhasil!</p>
                    <p>
                        Pin pemulihan akun: <strong>{pin}</strong>
                    </p>
                    <p>Silakan masuk dengan akun yang baru Anda buat!</p>
                    </>
                ),
                withCopy: true,
                copyText: pin,
                onClose: () => switchPanel("login")
            });
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Terjadi kesalahan server';
            showPopup({ message: errorMessage });
        }
    };

    const handleRecovery = async (e) => {
        e.preventDefault();
        if (!validateRecovery()) return;

        try {
            const response = await api.put('/users/verify-pin', {
                username: recoveryData.username,
                pin: recoveryData.pin
            });

            const { message, username } = response.data;

            setRecoveryUser({ username });

            showPopup({
                message: "Verifikasi berhasil. Silakan buat kata sandi baru",
                onClose: () => switchPanel("reset")
            });
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Terjadi kesalahan server';
            showPopup({ message: errorMessage });
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (!validateReset()) return;

        if (!recoveryUser) {
            showPopup({
                message: "Sesi pemulihan tidak valid. Silakan ulangi proses pemulihan."
            });
            switchPanel("recovery");
            return;
        }

         try {
            const response = await api.put('/users/reset-password', {
                username: recoveryUser.username,
                newPassword: resetData.password
            });

            const { message } = response.data;

            setRecoveryUser(null);

            showPopup({
                message: "Kata sandi telah diperbarui. Silakan login kembali",
                onClose: () => switchPanel("login")
            });
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Terjadi kesalahan server';
            showPopup({ message: errorMessage });
        }
    };

    const panelClass = (name) =>
        name === activePanel ? "tampil" : "tersembunyi";

    return (
    <div className="login-page">
        <div className="login-container">
        <div className="main-container">
            <div className="form-section">
                <main id="pembungkusHalaman">
                    <section id="panelLogin" className={panelClass("login")}>
                        <header className="kepalaHalaman">
                            <h1>Selamat Datang di BarangQ</h1>
                            <p>Silakan masukkan nama pengguna dan kata sandi Anda untuk melanjutkan</p>
                        </header>

                        <form id="formLogin" autoComplete="off" onSubmit={handleLogin} noValidate>
                            <div className="form-group">
                                <label htmlFor="login-username">Nama pengguna</label>
                                <input
                                    id="login-username"
                                    type="text"
                                    placeholder="Masukkan nama pengguna"
                                    className={errors["login-username"] ? "error" : ""}
                                    value={loginData.username}
                                    onChange={(e) => {
                                        setLoginData({ ...loginData, username: e.target.value });
                                        clearFieldError("login-username");
                                    }}
                                />
                                <p className={`error-text ${errors["login-username"] ? "show" : "hidden"}`}>
                                    {errors["login-username"]}
                                </p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="login-password">Kata sandi</label>
                                <input
                                    id="login-password"
                                    type="password"
                                    placeholder="Masukkan kata sandi"
                                    className={errors["login-password"] ? "error" : ""}
                                    value={loginData.password}
                                    onChange={(e) => {
                                        setLoginData({ ...loginData, password: e.target.value });
                                        clearFieldError("login-password");
                                    }}
                                />
                                <p className={`error-text ${errors["login-password"] ? "show" : "hidden"}`}>
                                    {errors["login-password"]}
                                </p>
                            </div>

                            <button type="submit" id="tombolLogin" className="tombolPrimer">
                                <span>Masuk</span>
                            </button>
                        </form>

                        <div className="panduanRegistrasi">
                            <p>Belum punya akun?</p>
                            <button
                                id="tombolRegister"
                                className="tombolSekunder"
                                type="button"
                                onClick={() => switchPanel("register")}
                            >
                                Registrasi
                            </button>
                        </div>

                        <div className="lupaPassword">
                            <button
                                id="tombolLupaPassword"
                                type="button"
                                className="tautanTeks"
                                onClick={() => switchPanel("recovery")}
                            >
                                Lupa Kata Sandi?
                            </button>
                        </div>
                    </section>

                    <section id="panelRegister" className={panelClass("register")}>
                        <header className="kepalaHalaman">
                            <h1>Registrasi Akun Baru</h1>
                            <p>Daftarkan diri Anda untuk mulai menggunakan BarangQ</p>
                        </header>

                        <form id="formRegister" autoComplete="off" onSubmit={handleRegister} noValidate>
                            <div className="form-group">
                                <label htmlFor="register-username">Nama Pengguna</label>
                                <input
                                    id="register-username"
                                    type="text"
                                    placeholder="Buat nama pengguna yang unik"
                                    className={errors["register-username"] ? "error" : ""}
                                    value={registerData.username}
                                    onChange={(e) => {
                                        setRegisterData({ ...registerData, username: e.target.value });
                                        clearFieldError("register-username");
                                    }}
                                />
                                <p className={`error-text ${errors["register-username"] ? "show" : "hidden"}`}>
                                    {errors["register-username"]}
                                </p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-namaToko">Nama Toko</label>
                                <input
                                    id="register-namaToko"
                                    type="text"
                                    placeholder="Masukkan nama toko"
                                    className={errors["register-namaToko"] ? "error" : ""}
                                    value={registerData.nama_toko}
                                    onChange={(e) => {
                                        setRegisterData({ ...registerData, nama_toko: e.target.value });
                                        clearFieldError("register-namaToko");
                                    }}
                                />
                                <p className={`error-text ${errors["register-namaToko"] ? "show" : "hidden"}`}>
                                    {errors["register-namaToko"]}
                                </p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-password">Kata Sandi</label>
                                <input
                                    id="register-password"
                                    type="password"
                                    placeholder="Buat kata sandi (min. 5 karakter)"
                                    className={errors["register-password"] ? "error" : ""}
                                    value={registerData.password}
                                    onChange={(e) => {
                                        setRegisterData({ ...registerData, password: e.target.value });
                                        clearFieldError("register-password");
                                    }}
                                />
                                <p className={`error-text ${errors["register-password"] ? "show" : "hidden"}`}>
                                    {errors["register-password"]}
                                </p>
                            </div>

                            <div className="tombolFormulir">
                                <button id="tombolDaftar" className="tombolPrimer">
                                    <span>Daftar</span>
                                </button>
                                <button
                                    id="tombolBatal"
                                    type="button"
                                    className="tombolSekunder"
                                    onClick={() => switchPanel("login")}
                                >
                                    Kembali
                                </button>
                            </div>
                        </form>
                    </section>

                    <section id="panelPemulihan" className={panelClass("recovery")}>
                        <header className="kepalaHalaman">
                            <h1>Pemulihan Akun</h1>
                            <p>Masukkan nama pengguna dan PIN pemulihan untuk reset kata sandi</p>
                        </header>

                        <form id="formLupaPassword" autoComplete="off" onSubmit={handleRecovery} noValidate>
                            <div className="form-group">
                                <label htmlFor="lupa-username">Nama Pengguna</label>
                                <input
                                    id="lupa-username"
                                    type="text"
                                    placeholder="Masukkan nama pengguna"
                                    className={errors["lupa-username"] ? "error" : ""}
                                    value={recoveryData.username}
                                    onChange={(e) => {
                                        setRecoveryData({ ...recoveryData, username: e.target.value });
                                        clearFieldError("lupa-username");
                                    }}
                                />
                                <p className={`error-text ${errors["lupa-username"] ? "show" : "hidden"}`}>
                                    {errors["lupa-username"]}
                                </p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="lupa-pin">PIN Pemulihan</label>
                                <input
                                    id="lupa-pin"
                                    type="password"
                                    placeholder="Masukkan pin 4 digit"
                                    className={errors["lupa-pin"] ? "error" : ""}
                                    value={recoveryData.pin}
                                    onChange={(e) => {
                                        setRecoveryData({ ...recoveryData, pin: e.target.value })
                                        clearFieldError("lupa-pin");
                                    }}
                                />
                                <p className={`error-text ${errors["lupa-pin"] ? "show" : "hidden"}`}>
                                    {errors["lupa-pin"]}
                                </p>
                            </div>

                            <div className="tombolFormulir">
                                <button id="tombolVerifikasi" className="tombolPrimer">
                                    Verifikasi
                                </button>
                                <button
                                    id="tombolBatalPemulihan"
                                    type="button"
                                    className="tombolSekunder"
                                    onClick={() => switchPanel("login")}
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </section>

                    <section id="panelResetPassword" className={panelClass("reset")}>
                        <header className="kepalaHalaman">
                            <h1>Reset Kata Sandi</h1>
                            <p>Buat kata sandi baru untuk akun Anda</p>
                        </header>

                        <form id="formResetPassword" autoComplete="off" onSubmit={handleReset} noValidate>
                            <div className="form-group">
                                <label htmlFor="reset-password">Kata Sandi Baru</label>
                                <input
                                    id="reset-password"
                                    type="password"
                                    placeholder="Buat kata sandi baru"
                                    className={errors["reset-password"] ? "error" : ""}
                                    value={resetData.password}
                                    onChange={(e) => {
                                        setResetData({ password: e.target.value });
                                        clearFieldError("reset-password");
                                    }}
                                />
                                <p className={`error-text ${errors["reset-password"] ? "show" : "hidden"}`}>
                                    {errors["reset-password"]}
                                </p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="reset-confirm">Konfirmasi Kata Sandi</label>
                                <input
                                    id="reset-confirm"
                                    type="password"
                                    placeholder="Konfirmasi kata sandi baru"
                                    className={errors["reset-confirm"] ? "error" : ""}
                                    value={confirmPassword.confirmPass}
                                    onChange={(e) => {
                                        setConfirmPassword({confirmPass: e.target.value});
                                        clearFieldError("reset-confirm");
                                    }}
                                />
                                <p className={`error-text ${errors["reset-confirm"] ? "show" : "hidden"}`}>
                                    {errors["reset-confirm"]}
                                </p>
                            </div>

                            <div className="tombolFormulir">
                                <button id="tombolSimpanPassword" className="tombolPrimer">
                                    Simpan
                                </button>
                                <button
                                    id="tombolBatalReset"
                                    type="button"
                                    className="tombolSekunder"
                                    onClick={() => switchPanel("login")}
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </section>
                </main>
            </div>
        </div>
        <Popup 
            open={popup.show} 
            message={popup.message} 
            withCopy={popup.withCopy}
            copyText={popup.copyText}
            onConfirm={closePopup} 
        />
        </div>
    </div>
    );
}