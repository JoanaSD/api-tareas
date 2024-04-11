require("dotenv").config();
const express = require("express");
const {json} = require("body-parser");
const cors = require("cors");
const {getTareas, crearTarea, borrarTarea} = require("./db");

const servidor = express();

servidor.use(cors());

servidor.use(json());

servidor.use("/mentirillas",express.static("./estaticos"));

servidor.get("/tareas", async (peticion, respuesta) => {
    try{
        let tareas = await getTareas();

        tareas = tareas.map( ({_id, tarea, estado}) => { return {id: _id, tarea, estado} } );

        respuesta.json(tareas);

    }catch(error){
        respuesta.status(500);
        respuesta.json(error);
    }
});

servidor.post("/tareas/nueva", async (peticion, respuesta, siguiente) => {
    let {tarea} = peticion.body;

    if(tarea && tarea.trim() != ""){

        try{
            let id = await crearTarea({tarea});
            return respuesta.json({id});

        }catch(error){
            respuesta.status(500);
            return respuesta.json(error);
        }
    }

    siguiente ({ error : "falta el argumento tarea en el objeto JSON" });
    
});

servidor.delete("/tareas/borrar/:id([a-f0-9]{24})", async (peticion, respuesta) => {
    try{
        let cantidad = await borrarTarea(peticion.params.id);
        respuesta.json({ resultado : cantidad > 0 ? "ok" : "ko" });

    }catch(error){
        respuesta.status(500);
        respuesta.json(error);
    }
});



servidor.use((peticion,respuesta) => {
    respuesta.status(404);
    respuesta.json({ error : "not found" });
});

servidor.use((error, peticion, respuesta, siguiente) => {
    respuesta.status(400);
    respuesta.json({ error : "petición no válida" });
});


servidor.listen(process.env.PORT);