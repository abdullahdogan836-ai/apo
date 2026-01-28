# Pusula Saat

Modern görünümlü, animasyonlu “PUSULA SAAT” başlığına sahip bir web tabanlı saat
uygulaması. Uygulama, analog/dijital saat, pusula görselliği, dünya saatleri,
alarm, kronometre ve geri sayım zamanlayıcı gibi özellikleri tek ekranda sunar.

## Özellikler

- Animasyonlu **PUSULA SAAT** başlığı ve neon/glas tarzı arayüz
- Analog saat ve dijital saat (12/24 saat formatı)
- Pusula halkası ve yön göstergesi (estetik animasyon)
- Tarih, haftanın günü, hafta numarası ve gün içi ilerleme
- Milisaniye, saniye ve tarih görünürlüğü seçenekleri
- Dil/yerel ayar (locale) ve zaman dilimi (timezone) seçimi
- Dünya saatleri listesi (seçilebilir şehirler)
- Alarm, kronometre ve geri sayım zamanlayıcı
- Tema rengi ve efekt yoğunluğu ayarları

## Çalıştırma

Herhangi bir statik dosya sunucusu ile çalıştırabilirsiniz:

```bash
python -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresini açın.

## Dosya Yapısı

- `index.html`: Uygulama sayfası
- `styles.css`: Modern tasarım ve animasyonlar
- `app.js`: Saat mantığı, kontroller ve etkileşimler
