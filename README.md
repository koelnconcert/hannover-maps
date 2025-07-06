Requirements
------------

```bash
apt install gdal-bin
```

Local development
-----------------

### backend

```bash
cd backend

npm ci
npm run data-download
npm run dev
```

### frontend

```bash
cd frontend

cp .env.example .env
# adjust .env to your needs

npm ci
npm run dev
```