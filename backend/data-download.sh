#!/bin/bash
set -e
BASE_DIR="$( dirname "$(realpath $0)" )"
cd $BASE_DIR

DOWNLOAD_DIR="$BASE_DIR/download/dop"
TILES_DIR="$BASE_DIR/public/tiles/dop"
mkdir -p $DOWNLOAD_DIR
mkdir -p $TILES_DIR

cd $DOWNLOAD_DIR

function prefix() {
  sed "s/^/$1/"
}

echo "Digitale Orthophotos (dop)"

YEARS="1957 1965 1977 1981 1991 2002 2006 2015 2021 2023"
PARTS="Nord"

for year in $YEARS; do
  echo "  $year"
  for part in $PARTS; do
    echo "    $part"
    name="${year}_${part}"
    file="$name.zip"
    remote_file="$file"
    [[ $year == 2023 ]] && remote_file="DOP20_Teil_${part}.zip"

    if [[ -e $file ]]; then
      echo "      downloading skipped, because $file already exists"
    else 
      url="https://opengeodata.hannover-stadt.de/$remote_file"
      echo "      downloading $url"
      wget --no-clobber --output-document "$file" "$url"
    fi

    echo "      unzipping $file"
    unzip -n $file -d $name | prefix "        "
  done
  
  vrtfile="$year.vrt"
  echo -n "    creating $vrtfile: "
  gdalbuildvrt $vrtfile ${year}_*/*.jpg

  processes=$(( $(nproc) * 3 / 4 ))
  tiledriver="WEBP"
  [[ $year -le 2002 ]] && tiledriver="JPEG" # grayscale images not supported by WEBP
  echo "    converting to $tiledriver tiles with $processes threads: "
  mkdir -p $TILES_DIR/$year
  gdal2tiles --resume --processes $processes --zoom 12-19 --xyz --s_srs EPSG:25832 --tiledriver $tiledriver $vrtfile $TILES_DIR/$year
done
