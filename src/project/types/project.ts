export type Favorite = {
  docente: string
  comentario?: string
  audio?: string
}

export type Project = {
  id: number
  nombre: string
  materia?: string
  docente?: string
  fecha?: string
  hora_inicio?: string
  resumen?: string
  descripcion?: string
  imagen_logo?: string
  imagen_portada?: string
  integrantes?: string[]
  despliegue?: string
  destacado?: boolean
  favoritos?: Favorite[]
}
