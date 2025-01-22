# Resmi Node.js imajını kullan
FROM node:20

# Çalışma dizini oluştur ve ayarla
WORKDIR /dockerapps/mafnu.tfo.k12.tr/front_end
#WORKDIR /Users/keremozkir/WebstormProjects/mafnu_frontend_v1

# Paketleri yüklemek için package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# SSL sertifikalarını container içine kopyalayın
#COPY /etc/pki/tls/certs/tfo.k12.tr.crt /etc/ssl/private/tfo.k12.tr.crt
#COPY /etc/pki/tls/certs/tfo.k12.tr.key /etc/ssl/private/tfo.k12.tr.key

# Paketleri yükle
RUN npm install
RUN npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion

# Uygulama kodlarını container'a kopyala
COPY . .

# Vite uygulaması için üretim build'i oluştur
RUN npm run build

# Uygulamayı çalıştırmak için port belirle
EXPOSE 5173

# Container başladığında çalıştırılacak komut
CMD ["npm", "run", "dev", "--", "--host"]

