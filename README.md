# Encuesta Online

Formulario de encuesta listo para desplegar en Render como servicio `Node`.

## Variables de entorno

- `AIRTABLE_TOKEN`: Personal Access Token de Airtable.
- `AIRTABLE_BASE`: ID de la base en Airtable.
- `AIRTABLE_TABLE`: ID o nombre de la tabla.
- `N8N_WEBHOOK`: webhook opcional de n8n.
- `PORT`: lo asigna Render automaticamente.

## Despliegue en Render

1. Sube este proyecto a GitHub.
2. En Render crea un `Web Service`.
3. En `Language` elige `Node`.
4. Usa estos valores:
   - `Build Command`: `npm install`
   - `Start Command`: `npm start`
5. Agrega las variables de entorno listadas arriba.
6. Despliega.

## Desarrollo local

```bash
npm install
npm start
```
