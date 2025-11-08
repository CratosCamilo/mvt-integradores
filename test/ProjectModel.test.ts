import ProjectModel from '../src/project/model/ProjectModel'
import { Project } from '../src/project/types/project'

import fs from 'node:fs'
import path from 'node:path'

// Mock de fs
jest.mock('node:fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}))

// Mock de path
jest.mock('node:path', () => ({
  join: jest.fn(),
  dirname: jest.fn()
}))

const mockProjects: Project[] = [
  {
    id: 1,
    nombre: 'Histofy',
    materia: 'PROYECTO INTEGRADOR II',
    docente: 'LENIN JAVIER SERRANO GIL',
    fecha: '10/28/2025',
    hora_inicio: '08:40',
    resumen: 'OCR con Flask y despliegue.',
    descripcion: 'Proyecto OCR con Flask (pdf2image, pytesseract), UI y demo.',
    integrantes: ['Malory Basanta', 'Ken Nelson'],
    destacado: true,
    favoritos: [
      { docente: 'LENIN JAVIER SERRANO GIL', comentario: 'Excelente demo y claridad en la expo.' }
    ]
  },
  {
    id: 2,
    nombre: 'Vizla',
    materia: 'PROYECTO INTEGRADOR II',
    docente: 'DANIT CASTELLANOS',
    fecha: '10/29/2025',
    hora_inicio: '09:20',
    resumen: 'Plataforma de analítica de proyectos.',
    integrantes: ['Daniel Aguilar', 'Pablo Bravo'],
    destacado: false,
    favoritos: []
  },
  {
    id: 3,
    nombre: 'Bifrost',
    materia: 'PROYECTO INTEGRADOR I',
    docente: 'SANDRA PILAR REYES HERNANDEZ',
    fecha: '10/29/2025',
    hora_inicio: '14:10',
    resumen: 'Gestión de proyectos con portafolio.',
    integrantes: ['Hansel Saavedra', 'Sergio Guerra'],
    destacado: false,
    favoritos: [
      { docente: 'SANDRA PILAR REYES HERNANDEZ', comentario: 'Gran integración de módulos y demo sólida.' }
    ]
  },
  {
    id: 4,
    nombre: 'Centro de Desarrollo de Software',
    materia: 'PROYECTO INTEGRADOR I',
    docente: 'OMAR RODRÍGUEZ',
    fecha: '10/30/2025',
    hora_inicio: '10:30',
    resumen: 'Sitio institucional y catálogo de servicios.',
    integrantes: ['Pedro Díaz']
    // sin favoritos
  }
]

describe('ProjectModel', () => {
  let model: ProjectModel

  beforeEach(() => {
    jest.clearAllMocks()
    ;(path.join as jest.Mock).mockReturnValue('/fake/path/projects.json')
    ;(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockProjects))
    model = new ProjectModel()
  })

  /* ====== BÁSICOS ====== */
  describe('getAll', () => {
    it('debería devolver todos los proyectos', () => {
      const projects = model.getAll()
      expect(projects).toHaveLength(4)
      expect(projects).toEqual(mockProjects)
    })

    it('debería devolver una copia, no la referencia original', () => {
      const projects1 = model.getAll()
      const projects2 = model.getAll()
      expect(projects1).not.toBe(projects2)
      expect(projects1).toEqual(projects2)
    })
  })

  describe('getById', () => {
    it('debería encontrar un proyecto por ID existente', () => {
      const project = model.getById(2)
      expect(project).toBeDefined()
      expect(project?.nombre).toBe('Vizla')
      expect(project?.materia).toBe('PROYECTO INTEGRADOR II')
    })

    it('debería devolver undefined para ID inexistente', () => {
      const project = model.getById(999)
      expect(project).toBeUndefined()
    })
  })

  describe('getFeatured', () => {
    it('debería devolver el proyecto destacado', () => {
      const featured = model.getFeatured()
      expect(featured).toBeDefined()
      expect(featured?.id).toBe(1)
      expect(featured?.destacado).toBe(true)
    })

    it('debería devolver undefined si no hay proyectos destacados', () => {
      ;(fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockProjects.map(p => ({ ...p, destacado: false })))
      )
      const newModel = new ProjectModel()
      expect(newModel.getFeatured()).toBeUndefined()
    })
  })

  describe('getLatest', () => {
    it('debería devolver array vacío si N es 0', () => {
      const latest = model.getLatest(0)
      expect(latest).toHaveLength(0)
    })

    it('debería devolver todos si N es mayor que el total', () => {
      const latest = model.getLatest(10)
      expect(latest).toHaveLength(4)
    })

    it('debería manejar valores negativos de N', () => {
      const latest = model.getLatest(-5)
      expect(latest).toHaveLength(0)
    })
  })

  /* ====== BÚSQUEDA ====== */
  describe('search', () => {
    it('debería buscar por nombre de proyecto', () => {
      const results = model.search('Histofy')
      expect(results).toHaveLength(1)
      expect(results[0].nombre).toBe('Histofy')
    })

    it('debería buscar por docente', () => {
      const results = model.search('LENIN')
      expect(results.some(p => p.docente === 'LENIN JAVIER SERRANO GIL')).toBe(true)
    })

    it('debería buscar por materia (igualdad exacta)', () => {
      const results = model.search('PROYECTO INTEGRADOR I')
      expect(results).toHaveLength(2)
      expect(results.every(p => p.materia === 'PROYECTO INTEGRADOR I')).toBe(true)
    })

    it('debería buscar por integrante', () => {
      const results = model.search('Malory Basanta')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe(1)
    })

    it('debería buscar por fecha (año)', () => {
      const results = model.search('2025')
      expect(results).toHaveLength(4)
    })

    it('debería ser case-insensitive', () => {
      const results = model.search('HISTOFY')
      expect(results).toHaveLength(1)
      expect(results[0].nombre).toBe('Histofy')
    })

    it('debería devolver todos los proyectos si la búsqueda está vacía', () => {
      const results = model.search('')
      expect(results).toHaveLength(4)
    })

    it('debería devolver array vacío si no hay coincidencias', () => {
      const results = model.search('NoExiste')
      expect(results).toHaveLength(0)
    })
  })

  /* ====== PAGINACIÓN ====== */
  describe('paginate', () => {
    it('debería paginar correctamente', () => {
      const result = model.paginate(mockProjects, 1, 2)
      expect(result.items).toHaveLength(2)
      expect(result.page).toBe(1)
      expect(result.total).toBe(4)
      expect(result.totalPages).toBe(2)
    })

    it('debería devolver la segunda página', () => {
      const result = model.paginate(mockProjects, 2, 2)
      expect(result.items).toHaveLength(2)
      expect(result.page).toBe(2)
      expect(result.items[0].id).toBe(3)
    })

    it('debería manejar página mayor que totalPages', () => {
      const result = model.paginate(mockProjects, 10, 2)
      expect(result.page).toBe(2)
      expect(result.totalPages).toBe(2)
    })

    it('debería manejar página menor que 1', () => {
      const result = model.paginate(mockProjects, 0, 2)
      expect(result.page).toBe(1)
    })

    it('debería manejar array vacío', () => {
      const result = model.paginate([], 1, 10)
      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(1)
    })
  })

  /* ====== MATERIAS / DOCENTES ====== */
  describe('getUniqueMaterias', () => {
    it('debería devolver materias únicas ordenadas', () => {
      const materias = model.getUniqueMaterias()
      expect(materias).toEqual([
        'PROYECTO INTEGRADOR I',
        'PROYECTO INTEGRADOR II'
      ])
    })

    it('debería filtrar valores undefined', () => {
      ;(fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify([
          { ...mockProjects[0] },
          { ...mockProjects[1], materia: undefined }
        ])
      )
      const newModel = new ProjectModel()
      const materias = newModel.getUniqueMaterias()
      expect(materias).not.toContain(undefined as any)
    })
  })

  describe('getUniqueDocentesByMateria', () => {
    it('debería devolver docentes de una materia específica', () => {
      const docentes = model.getUniqueDocentesByMateria('PROYECTO INTEGRADOR II')
      expect(docentes).toEqual(['DANIT CASTELLANOS', 'LENIN JAVIER SERRANO GIL'])
    })

    it('debería devolver array vacío para materia inexistente', () => {
      const docentes = model.getUniqueDocentesByMateria('HISTORIA')
      expect(docentes).toHaveLength(0)
    })
  })

  describe('getByMateria', () => {
    it('debería devolver todos los proyectos de una materia', () => {
      const projects = model.getByMateria('PROYECTO INTEGRADOR I')
      expect(projects).toHaveLength(2)
      expect(projects.every(p => p.materia === 'PROYECTO INTEGRADOR I')).toBe(true)
    })

    it('debería devolver array vacío para materia inexistente', () => {
      const projects = model.getByMateria('HISTORIA')
      expect(projects).toHaveLength(0)
    })
  })

  describe('getByMateriaAndDocente', () => {
    it('debería filtrar por materia y docente', () => {
      const projects = model.getByMateriaAndDocente('PROYECTO INTEGRADOR II', 'LENIN JAVIER SERRANO GIL')
      expect(projects).toHaveLength(1)
      expect(projects.every(p => p.materia === 'PROYECTO INTEGRADOR II' && p.docente === 'LENIN JAVIER SERRANO GIL')).toBe(true)
    })

    it('debería devolver todos de la materia si no se especifica docente', () => {
      const projects = model.getByMateriaAndDocente('PROYECTO INTEGRADOR II')
      expect(projects).toHaveLength(2)
    })

    it('debería devolver array vacío si no hay coincidencias', () => {
      const projects = model.getByMateriaAndDocente('PROYECTO INTEGRADOR II', 'DOCENTE INEXISTENTE')
      expect(projects).toHaveLength(0)
    })
  })

  /* ====== FAVORITOS POR DOCENTE ====== */
  describe('hasFavoriteForDocente', () => {
    it('true si el proyecto tiene favorito del docente exacto', () => {
      const project = mockProjects[0] // Histofy
      expect(model.hasFavoriteForDocente(project, 'LENIN JAVIER SERRANO GIL')).toBe(true)
    })

    it('false si no tiene favorito del docente indicado', () => {
      const project = mockProjects[0]
      expect(model.hasFavoriteForDocente(project, 'DANIT CASTELLANOS')).toBe(false)
    })

    it('true si tiene algún favorito y no se especifica docente', () => {
      const project = mockProjects[0]
      expect(model.hasFavoriteForDocente(project)).toBe(true)
    })

    it('false si el proyecto no tiene favoritos', () => {
      const project = mockProjects[1]
      expect(model.hasFavoriteForDocente(project, 'LENIN JAVIER SERRANO GIL')).toBe(false)
    })

    it('false si favoritos es undefined o no es array', () => {
      const project = { ...mockProjects[0], favoritos: undefined as any }
      expect(model.hasFavoriteForDocente(project, 'LENIN JAVIER SERRANO GIL')).toBe(false)
    })
  })

  describe('getFavoritesOfProject', () => {
    it('devuelve el array de favoritos cuando existe', () => {
      const project = mockProjects[2] // Bifrost
      const favorites = model.getFavoritesOfProject(project)
      expect(Array.isArray(favorites)).toBe(true)
      expect(favorites).toHaveLength(1)
      expect(favorites[0].docente).toBe('SANDRA PILAR REYES HERNANDEZ')
    })

    it('[] si no hay favoritos', () => {
      const project = mockProjects[1]
      const favorites = model.getFavoritesOfProject(project)
      expect(favorites).toHaveLength(0)
    })

    it('[] si favoritos no es un array', () => {
      const project = { ...mockProjects[0], favoritos: undefined as any }
      const favorites = model.getFavoritesOfProject(project)
      expect(favorites).toEqual([])
    })
  })
})
