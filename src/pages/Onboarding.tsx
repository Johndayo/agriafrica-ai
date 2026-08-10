import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/contexts/LanguageContext";
import { languageLabels, type Language } from "@/lib/translations";
import { User, Phone, MapPin, Wheat, ArrowRight, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Onboarding — Multi-step profile setup wizard (Tailwind premium card)
// ---------------------------------------------------------------------------
export default function Onboarding() {
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const { setProfile, completeOnboarding } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [crops, setCrops] = useState("");

  const languageKeys = Object.keys(languageLabels) as Language[];

  // -----------------------------------------------------------------------
  // Step 1: Language selection
  // -----------------------------------------------------------------------
  function handleLanguageSelect(lang: Language) {
    setLanguage(lang);
    setStep(2);
  }

  // -----------------------------------------------------------------------
  // Step 2: Personal info
  // -----------------------------------------------------------------------
  function handlePersonalInfoNext(e: FormEvent) {
    e.preventDefault();
    setStep(3);
  }

  // -----------------------------------------------------------------------
  // Step 3: Farm details → persist & navigate
  // -----------------------------------------------------------------------
  async function handleComplete(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      setProfile({
        full_name: fullName,
        phone,
        location,
        farm_size_hectares: parseFloat(farmSize) || 0,
        crops_grown: crops.split(",").map((c) => c.trim()).filter(Boolean),
      });
      completeOnboarding();
      navigate("/dashboard");
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="w-full h-full bg-[#F0F2F5] flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 w-full max-w-[400px] text-[#1A1A2E] flex flex-col gap-4 animate-fade-in">

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-1" aria-label={`Step ${step} of 3`}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s <= step
                  ? "w-6 bg-[#00A600]"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* ---- Step 1: Language ---- */}
        {step === 1 && (
          <>
            <h1 className="text-xl font-bold text-center text-[#1A1A2E] tracking-tight">
              {t.onboarding_welcome}
            </h1>
            <p className="text-sm text-center text-gray-500 mb-2">
              {t.onboarding_language_prompt}
            </p>

            <div className="grid grid-cols-2 gap-2.5 w-full">
              {languageKeys.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageSelect(lang)}
                  className={`h-12 min-h-[48px] px-3 border rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] select-none text-center touch-manipulation ${
                    language === lang
                      ? "border-[#00A600] bg-[#00A600]/5 text-[#00A600] font-semibold ring-1 ring-[#00A600]"
                      : "border-[#E5E7EB] bg-white text-[#1A1A2E] hover:border-gray-400"
                  }`}
                >
                  {languageLabels[lang]}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ---- Step 2: Personal Info ---- */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-center text-[#1A1A2E] tracking-tight">
              {t.onboarding_name_label}
            </h2>

            <form onSubmit={handlePersonalInfoNext} className="flex flex-col gap-3">
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  autoComplete="name"
                  placeholder={t.onboarding_name_placeholder}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12 w-full pl-10 pr-3 border border-[#E5E7EB] rounded-xl bg-gray-50/50 text-sm focus:border-[#00A600] focus:bg-white outline-none transition-all text-[#1A1A2E] placeholder:text-gray-400"
                />
              </div>

              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t.onboarding_phone_placeholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-12 w-full pl-10 pr-3 border border-[#E5E7EB] rounded-xl bg-gray-50/50 text-sm focus:border-[#00A600] focus:bg-white outline-none transition-all text-[#1A1A2E] placeholder:text-gray-400"
                />
              </div>

              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  autoComplete="address-level2"
                  placeholder={t.onboarding_location_placeholder}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="h-12 w-full pl-10 pr-3 border border-[#E5E7EB] rounded-xl bg-gray-50/50 text-sm focus:border-[#00A600] focus:bg-white outline-none transition-all text-[#1A1A2E] placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                className="h-12 w-full bg-[#00A600] hover:bg-[#009400] text-white rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center cursor-pointer select-none min-h-[48px] mt-1"
              >
                {t.next}
                <ArrowRight size={18} className="ml-2" />
              </button>
            </form>
          </>
        )}

        {/* ---- Step 3: Farm Details ---- */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold text-center text-[#1A1A2E] tracking-tight">
              {t.profile_farm_details}
            </h2>

            <form onSubmit={handleComplete} className="flex flex-col gap-3">
              <div className="relative">
                <Wheat size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={t.onboarding_farm_size_placeholder}
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  min="0"
                  step="0.1"
                  className="h-12 w-full pl-10 pr-3 border border-[#E5E7EB] rounded-xl bg-gray-50/50 text-sm focus:border-[#00A600] focus:bg-white outline-none transition-all text-[#1A1A2E] placeholder:text-gray-400"
                />
              </div>

              <div className="relative">
                <Wheat size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  autoComplete="off"
                  placeholder={t.onboarding_crops_placeholder}
                  value={crops}
                  onChange={(e) => setCrops(e.target.value)}
                  className="h-12 w-full pl-10 pr-3 border border-[#E5E7EB] rounded-xl bg-gray-50/50 text-sm focus:border-[#00A600] focus:bg-white outline-none transition-all text-[#1A1A2E] placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-[#00A600] hover:bg-[#009400] text-white rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center cursor-pointer select-none min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {t.onboarding_complete_btn}
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
