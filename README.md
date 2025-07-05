Requirements
------------

```bash
apt install gdal-bin
```

Local development
-----------------

```bash
cp .env.example .env
# adjust .env to your needs

npm ci
npm run data-download
npm run dev
```