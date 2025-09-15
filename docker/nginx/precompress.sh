#!/bin/sh

# Script de pré-compression des assets statiques
echo "🗜️ Démarrage de la pré-compression des assets..."

# Fonction pour compresser un fichier
compress_file() {
    local file="$1"
    local base_name=$(basename "$file")
    local dir_name=$(dirname "$file")
    
    # Gzip compression
    if [ ! -f "${file}.gz" ] || [ "$file" -nt "${file}.gz" ]; then
        echo "Compression Gzip: $base_name"
        gzip -c -9 "$file" > "${file}.gz"
    fi
    
    # Brotli compression (si disponible)
    if command -v brotli >/dev/null 2>&1; then
        if [ ! -f "${file}.br" ] || [ "$file" -nt "${file}.br" ]; then
            echo "Compression Brotli: $base_name"
            brotli -c -q 11 "$file" > "${file}.br"
        fi
    fi
}

# Compresser les fichiers CSS et JS
find /usr/share/nginx/html -type f \( -name "*.css" -o -name "*.js" \) | while read -r file; do
    compress_file "$file"
done

# Compresser les fichiers HTML
find /usr/share/nginx/html -type f -name "*.html" | while read -r file; do
    compress_file "$file"
done

# Compresser les fichiers JSON
find /usr/share/nginx/html -type f -name "*.json" | while read -r file; do
    compress_file "$file"
done

# Compresser les fichiers XML
find /usr/share/nginx/html -type f -name "*.xml" | while read -r file; do
    compress_file "$file"
done

# Compresser les fichiers SVG
find /usr/share/nginx/html -type f -name "*.svg" | while read -r file; do
    compress_file "$file"
done

echo "✅ Pré-compression terminée"

# Afficher les statistiques de compression
echo "📊 Statistiques de compression:"
total_original=0
total_gzip=0
total_brotli=0

find /usr/share/nginx/html -type f \( -name "*.css" -o -name "*.js" -o -name "*.html" \) | while read -r file; do
    if [ -f "$file" ]; then
        original_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0)
        total_original=$((total_original + original_size))
        
        if [ -f "${file}.gz" ]; then
            gzip_size=$(stat -c%s "${file}.gz" 2>/dev/null || stat -f%z "${file}.gz" 2>/dev/null || echo 0)
            total_gzip=$((total_gzip + gzip_size))
        fi
        
        if [ -f "${file}.br" ]; then
            brotli_size=$(stat -c%s "${file}.br" 2>/dev/null || stat -f%z "${file}.br" 2>/dev/null || echo 0)
            total_brotli=$((total_brotli + brotli_size))
        fi
    fi
done

echo "Taille originale: ${total_original} bytes"
echo "Taille Gzip: ${total_gzip} bytes"
echo "Taille Brotli: ${total_brotli} bytes"

if [ $total_original -gt 0 ]; then
    gzip_ratio=$((100 - (total_gzip * 100 / total_original)))
    brotli_ratio=$((100 - (total_brotli * 100 / total_original)))
    echo "Économie Gzip: ${gzip_ratio}%"
    echo "Économie Brotli: ${brotli_ratio}%"
fi

echo "🚀 Démarrage de Nginx..."
exec nginx -g "daemon off;"
