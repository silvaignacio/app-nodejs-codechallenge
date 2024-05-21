### Instalación

- `cd server && npm install` para instalar las dependencias de la app **server**
- `cd ..` para volver a la raíz del proyecto
- `cd anti-fraud && npm install` para instalar las dependencias de la app **anti-fraud**

### Instalación Docker
- `docker-compose up -d` para levantar los servicios de **postgres**, **zookeper** y **kafka**

### Inicializar servicios
- `cd anti-fraud&& npm run start:anti-fraud` para iniciar el servicio **anti-fraud**
- `cd ..` para volver a la raíz del proyecto
- `cd server && npm run start:server` para iniciar el servicio **server**

### Curls de prueba

####  Crear Transacción aprobada
```
curl --location 'http://localhost:3001/transactions' \
--header 'Content-Type: application/json' \
--data '{
  "accountExternalIdDebit": "7eed7337-bbd1-4f13-ab18-75384f6cb883",
  "accountExternalIdCredit": "36b5e8c5-aba2-4372-bccb-687e352fa02b",
  "tranferTypeId": 2,
  "value": 120
}'
```
####  Crear Transacción rechazada
```
curl --location 'http://localhost:3001/transactions' \
--header 'Content-Type: application/json' \
--data '{
  "accountExternalIdDebit": "90dc40bf-c129-48df-9d2f-a8e4b744d0e0",
  "accountExternalIdCredit": "54b0b5e8-bc28-4027-8baa-831b84eb8857",
  "tranferTypeId": 1,
  "value": 1200
}'
```

####  Obtener Transacción
```
curl --location 'http://localhost:3001/transactions/:id'
```
