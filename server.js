const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

app.post("/api/survey", async (req, res) => {
  try {
    const { id_estudiante, nivel_satisfaccion, claridad_contenido, aplicabilidad_practica, comentarios_adicionales } = req.body || {};

    if (!id_estudiante || !nivel_satisfaccion || !claridad_contenido || !aplicabilidad_practica) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    const airtableToken = requireEnv("AIRTABLE_TOKEN");
    const airtableBase = requireEnv("AIRTABLE_BASE");
    const airtableTable = requireEnv("AIRTABLE_TABLE");
    const n8nWebhook = process.env.N8N_WEBHOOK;

    const fields = {
      IddelEstudiante: String(id_estudiante).trim(),
      NiveldeSatisfacion: Number(nivel_satisfaccion),
      ClaridadCOntenido: Number(claridad_contenido),
      AplicabilidaPractica: Number(aplicabilidad_practica)
    };

    if (comentarios_adicionales && String(comentarios_adicionales).trim()) {
      fields.ComentariosAdicionales = String(comentarios_adicionales).trim();
    }

    const airtableUrl = `https://api.airtable.com/v0/${airtableBase}/${encodeURIComponent(airtableTable)}`;
    const pendingRequests = [
      fetch(airtableUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${airtableToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields })
      })
    ];

    if (n8nWebhook) {
      pendingRequests.push(
        fetch(n8nWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(fields)
        }).catch((error) => {
          console.warn("n8n webhook failed:", error.message);
          return null;
        })
      );
    }

    const [airtableResponse] = await Promise.all(pendingRequests);

    if (!airtableResponse || !airtableResponse.ok) {
      const airtableError = airtableResponse ? await airtableResponse.text() : "No response from Airtable";
      throw new Error(airtableError);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Survey submission failed:", error.message);
    res.status(500).json({ error: "No se pudo guardar la respuesta." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
