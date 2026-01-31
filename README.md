# 🏫 Ekol-Pano Pro | Akıllı Dijital Okul Panosu

Ekol-Pano Pro; modern eğitim kurumları için geliştirilmiş, **Google Gemini AI** destekli, çift okul (Sabah/Öğle) yönetim kabiliyetine sahip ve Android TV sistemleri için optimize edilmiş yeni nesil bir dijital tabela (Digital Signage) çözümüdür.

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-Enabled-orange?style=for-the-badge&logo=google-gemini)
![Android TV](https://img.shields.io/badge/Android_TV-Compatible-green?style=for-the-badge&logo=android)

---

## 🚀 Öne Çıkan Özellikler

### 🌗 Çift Okul (Dual-Shift) Yönetimi
*   **Sabah ve Öğle Grupları:** Tek bir panel üzerinden her iki okulun verilerini (ad, slogan, ders saatleri) tamamen bağımsız yönetin.
*   **Otomatik Geçiş:** Belirlenen saatlerde veya periyotlarda ekran otomatik olarak ilgili okul moduna (Sabah/Öğle) geçer.

### 🤖 Yapay Zeka (Gemini AI) Entegrasyonu
*   **Duyuru İyileştirme:** Ham metin halindeki duyuruları kurumsal ve profesyonel bir dile otomatik dönüştürür.
*   **Günlük Motivasyon:** Öğrenciler ve öğretmenler için her gün taze ve ilham verici sözler üretir.

### ⏲️ Dinamik Zamanlama Sistemi
*   **Canlı Geri Sayım:** "Dersin bitimine kalan" veya "Zile kalan" süreyi saniye hassasiyetinde dev ekranda gösterir.
*   **Nöbetçi Çizelgesi:** Haftanın her günü için farklı kat ve görev yerlerine göre otomatik kayan nöbetçi listesi.

### 🎂 Sosyal ve Etkinlik Yönetimi
*   **Doğum Günleri:** Excel'den toplu kopyala-yapıştır ile doğum günü listesi aktarımı.
*   **Özel Günler:** Milli bayramlar ve okul etkinlikleri için şık görsel kutlamalar.

---

## 🛠️ Kurulum ve Yayına Alma

### 1. Yerel Çalıştırma
Projeyi bilgisayarınızda test etmek için:
```bash
# Repoyu klonlayın
git clone https://github.com/KULLANICI_ADINIZ/ekol-pano-pro.git

# Proje dizinine girin
cd ekol-pano-pro

# Geliştirici modunda açın (veya dosyayı direkt tarayıcıda çalıştırın)
# Not: Bu proje es6 modülleri kullandığı için bir HTTP sunucusu (Live Server vb.) gerektirir.
```

### 2. Vercel / Netlify Üzerinden Yayınlama (Ücretsiz)
1. GitHub deponuzu Vercel'e bağlayın.
2. **Environment Variables** (Ortam Değişkenleri) kısmına şunu ekleyin:
   - `API_KEY`: Google AI Studio'dan aldığınız Gemini API anahtarı.
3. Yayınla (Deploy) butonuna basın.

---

## 📺 Koridorlardaki Android TV Ayarları

Okul koridorlarındaki 5 adet Android TV'de profesyonel sonuç almak için:

1.  **Uygulama:** Google Play Store'dan **Fully Kiosk Browser** (Önerilen) veya **Puffin TV** indirin.
2.  **Otomatik Başlatma:** TV açıldığında panonun otomatik açılması için "Start on Boot" seçeneğini aktif edin.
3.  **Kiosk Modu:** Adres çubuğunu ve navigasyonu gizleyerek tam ekran moduna alın.
4.  **Ekran Ayarı:** TV'nin uyku moduna (Sleep) geçmesini engelleyin.

---

## 🏗️ Teknik Mimari
- **Frontend:** React 19 (Hooks, Functional Components)
- **Styling:** Tailwind CSS v4 (Modern JIT motoru)
- **Icons:** Lucide React (SVG tabanlı hafif ikonlar)
- **AI:** Google Generative AI (Gemini 2.5 Flash / Gemini 3)
- **State:** LocalStorage tabanlı konfigürasyon (Kalıcı ayarlar)

---

## 📄 Lisans
Bu proje **MIT Lisansı** ile lisanslanmıştır. Okullarda ticari veya bireysel olarak özgürce kullanılabilir, geliştirilebilir.

---
*Geliştiren: [Sizin İsminiz]*
*Katkıda Bulunmak İçin: Pull Request göndermekten çekinmeyin!*
