'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useCardapio } from '@/hooks/useCardapioFirebase'

export default function CardapioPage() {
  const { signOut } = useAuth()
  const {
    products: savedProducts,
    additionals: savedAdditionals,
    categories: firebaseCategories,
    additionalCategories: firebaseAdditionalCategories,
    loading: cardapioLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    createAdditional,
    updateAdditional,
    deleteAdditional,
    createCategory,
    updateCategory,
    deleteCategory,
    createAdditionalCategory,
    updateAdditionalCategory,
    deleteAdditionalCategory,

  } = useCardapio()

  const pathname = usePathname()
  const isPedidosActive = pathname === '/pedidos'
  const isCardapioActive = pathname === '/cardapio'
  const isAdministrarLojaActive = pathname === '/administrar'
  const isRelatoriosActive = pathname === '/relatorios'
  const [activeCategory, setActiveCategory] = useState('')
  const [selectedCategoryInList, setSelectedCategoryInList] = useState('')
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [isProductActive, setIsProductActive] = useState(true)
  const [activeFilterButton, setActiveFilterButton] = useState('Produtos')
  const [selectedAdditional, setSelectedAdditional] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('Opcional')
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [categorySelectionType, setCategorySelectionType] = useState<'unica' | 'multipla' | 'somavel'>('unica')
  const [minQuantity, setMinQuantity] = useState('0')
  const [maxQuantity, setMaxQuantity] = useState('3')
  const [selectedAdditionalIds, setSelectedAdditionalIds] = useState<string[]>([])
  const [productAdditionals, setProductAdditionals] = useState<string[]>([])
  const [isModalAnimating, setIsModalAnimating] = useState(false)


  // Estados derivados do Firebase
  const categories = firebaseCategories.map(cat => cat.name)
  const additionalCategories = firebaseAdditionalCategories.map(cat => cat.name)
  const categoryStates: { [key: string]: boolean } = firebaseCategories.reduce((acc, cat) => ({
    ...acc,
    [cat.name]: cat.isActive
  }), {})
  const categoryStatuses: { [key: string]: 'ativo' | 'inativo' | 'em-falta' } = firebaseCategories.reduce((acc, cat) => ({
    ...acc,
    [cat.name]: cat.status
  }), {})
  const additionalStates: { [key: string]: boolean } = firebaseAdditionalCategories.reduce((acc, cat) => ({
    ...acc,
    [cat.name]: cat.isActive
  }), {})
  const additionalStatuses: { [key: string]: 'ativo' | 'inativo' | 'em-falta' } = firebaseAdditionalCategories.reduce((acc, cat) => ({
    ...acc,
    [cat.name]: cat.status
  }), {})
  const [nameError, setNameError] = useState('')
  const [openMenuCategory, setOpenMenuCategory] = useState<string | null>(null)
  const [categoryStatus, setCategoryStatus] = useState<'ativo' | 'inativo' | 'em-falta'>('ativo')
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [showNewProductArea, setShowNewProductArea] = useState(false)
  const [showNewAdditionalArea, setShowNewAdditionalArea] = useState(false)
  const [showEditProductArea, setShowEditProductArea] = useState(false)
  const [showEditAdditionalArea, setShowEditAdditionalArea] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingAdditionalId, setEditingAdditionalId] = useState<string | null>(null)
  const [productImageUrl, setProductImageUrl] = useState('/product-placeholder.jpg')
  const [additionalImageUrl, setAdditionalImageUrl] = useState('/product-placeholder.jpg')
  const [productName, setProductName] = useState('')
  const [additionalName, setAdditionalName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [additionalDescription, setAdditionalDescription] = useState('')
  const [selectedProductCategory, setSelectedProductCategory] = useState('')
  const [selectedAdditionalCategory, setSelectedAdditionalCategory] = useState('')
  const [isProductCategoryDropdownOpen, setIsProductCategoryDropdownOpen] = useState(false)
  const [isAdditionalCategoryDropdownOpen, setIsAdditionalCategoryDropdownOpen] = useState(false)
  const [productPrice, setProductPrice] = useState('R$ 0,00')
  const [additionalPrice, setAdditionalPrice] = useState('R$ 0,00')
  const [contentHeight, setContentHeight] = useState(740)
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string>('')
  const [uploadingForAdditional, setUploadingForAdditional] = useState(false)
  const [cropPosition, setCropPosition] = useState({ x: 45, y: 45 }) // Posição inicial centralizada
  const [cropSize, setCropSize] = useState({ width: 210, height: 210 }) // Tamanho do crop
  const [imageDimensions, setImageDimensions] = useState({ width: 400, height: 400 }) // Dimensões da imagem
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isClosingModal, setIsClosingModal] = useState(false)

  const [showModalContent, setShowModalContent] = useState(false)

  const [showAddAdditionalsModal, setShowAddAdditionalsModal] = useState(false)
  const [isClosingAddAdditionalsModal, setIsClosingAddAdditionalsModal] = useState(false)
  const [showAddAdditionalsModalContent, setShowAddAdditionalsModalContent] = useState(false)
  const [currentProductActive, setCurrentProductActive] = useState(true)
  const [portionSize, setPortionSize] = useState('')
  const [portionUnit, setPortionUnit] = useState('')
  const [servesUpTo, setServesUpTo] = useState('')
  const [isPortionUnitDropdownOpen, setIsPortionUnitDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const productCategoryDropdownRef = useRef<HTMLDivElement>(null)
  const additionalCategoryDropdownRef = useRef<HTMLDivElement>(null)
  const portionUnitDropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Definir primeira categoria como ativa quando carregar as categorias
  useEffect(() => {
    if (firebaseCategories.length > 0 && activeCategory === '') {
      const firstCategory = firebaseCategories[0].name
      setActiveCategory(firstCategory)
      setSelectedCategoryInList(firstCategory)
    }
  }, [firebaseCategories, activeCategory])

  // Definir primeira categoria como selecionada no produto quando carregar
  useEffect(() => {
    if (firebaseCategories.length > 0 && selectedProductCategory === '') {
      setSelectedProductCategory(firebaseCategories[0].name)
    }
  }, [firebaseCategories, selectedProductCategory])

  // Definir primeira categoria de adicional como selecionada quando carregar
  useEffect(() => {
    if (firebaseAdditionalCategories.length > 0 && selectedAdditionalCategory === '') {
      setSelectedAdditionalCategory(firebaseAdditionalCategories[0].name)
    }
  }, [firebaseAdditionalCategories, selectedAdditionalCategory])

  // Atualizar altura do conteúdo baseado na quantidade de adicionais
  useEffect(() => {
    if (showNewProductArea || showEditProductArea) {
      const baseHeight = 740
      const additionalsListHeight = productAdditionals.length * 110 // 98px altura + 12px margin-bottom por item
      const newContentHeight = Math.max(baseHeight, baseHeight + additionalsListHeight)
      setContentHeight(newContentHeight)
    }
  }, [productAdditionals, showNewProductArea, showEditProductArea])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Fechar dropdown de categoria do produto quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productCategoryDropdownRef.current && !productCategoryDropdownRef.current.contains(event.target as Node)) {
        setIsProductCategoryDropdownOpen(false)
      }
    }

    if (isProductCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProductCategoryDropdownOpen])

  // Fechar dropdown de unidade quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (portionUnitDropdownRef.current && !portionUnitDropdownRef.current.contains(event.target as Node)) {
        setIsPortionUnitDropdownOpen(false)
      }
    }

    if (isPortionUnitDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPortionUnitDropdownOpen])

  // Fechar dropdown de categoria do adicional quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (additionalCategoryDropdownRef.current && !additionalCategoryDropdownRef.current.contains(event.target as Node)) {
        setIsAdditionalCategoryDropdownOpen(false)
      }
    }

    if (isAdditionalCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAdditionalCategoryDropdownOpen])



  // Fechar menu de categoria quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuCategory(null)
      }
    }

    if (openMenuCategory) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuCategory])

  // Fechar modal e resetar estados quando pressionar ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (openMenuCategory) {
          setOpenMenuCategory(null)
        } else if (showAddAdditionalsModal) {
          closeAddAdditionalsModal()
        } else if (isDropdownOpen) {
          setIsDropdownOpen(false)
        } else if (isPortionUnitDropdownOpen) {
          setIsPortionUnitDropdownOpen(false)
        } else if (isAdditionalCategoryDropdownOpen) {
          setIsAdditionalCategoryDropdownOpen(false)

        } else if (showModal) {
          closeModal()
        }
      }
    }

    if (showModal) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
      }, [showModal, showAddAdditionalsModal, isDropdownOpen, isPortionUnitDropdownOpen, isAdditionalCategoryDropdownOpen])

  // Função para salvar nova categoria
  const handleSaveCategory = async () => {
    // Validar se o nome foi preenchido
    if (!categoryName.trim()) {
      setNameError('Nome da categoria é obrigatório')
      return
    }



    // Verificar se a categoria já existe (apenas no modo criação)
    if (!isEditingCategory && categories.includes(categoryName.trim())) {
      setNameError('Esta categoria já existe')
      return
    }
    
    // Verificar se o nome foi alterado para um que já existe (modo edição)
    if (isEditingCategory) {
      if (activeFilterButton === 'Adicionais') {
        const currentAdditionalCategory = firebaseAdditionalCategories.find(cat => cat.id === editingCategoryId)
        const isNameChanged = currentAdditionalCategory && currentAdditionalCategory.name !== categoryName.trim()
        if (isNameChanged && additionalCategories.includes(categoryName.trim())) {
          setNameError('Esta categoria já existe')
          return
        }
      } else {
        const currentCategory = firebaseCategories.find(cat => cat.id === editingCategoryId)
        const isNameChanged = currentCategory && currentCategory.name !== categoryName.trim()
        if (isNameChanged && categories.includes(categoryName.trim())) {
          setNameError('Esta categoria já existe')
          return
        }
      }
    }

    // Validar quantidades para categorias múltipla e somável
    if (activeFilterButton === 'Adicionais' && (categorySelectionType === 'multipla' || categorySelectionType === 'somavel')) {
      const min = parseInt(minQuantity)
      const max = parseInt(maxQuantity)
      
      if (max <= 0) {
        alert('Quantidade máxima deve ser maior que 0')
        return
      }
      
      if (min >= max) {
        alert('Quantidade mínima deve ser menor que a máxima')
        return
      }
    }

    try {
      if (isEditingCategory && editingCategoryId) {
        // Modo edição
        if (activeFilterButton === 'Adicionais') {
          await updateAdditionalCategory(editingCategoryId, {
            name: categoryName.trim(),
            description: categoryDescription.trim(),
            status: categoryStatus,
            isActive: selectedTemplate === 'Opcional',
            selectionType: categorySelectionType,
            minQuantity: parseInt(minQuantity) || 0,
            maxQuantity: parseInt(maxQuantity) || 3,
          })
        } else {
          await updateCategory(editingCategoryId, {
            name: categoryName.trim(),
            description: categoryDescription.trim(),
            status: categoryStatus,
            isActive: selectedTemplate === 'Opcional',
          })
        }
      } else {
        // Modo criação
        if (activeFilterButton === 'Adicionais') {
          await createAdditionalCategory({
            name: categoryName.trim(),
            description: categoryDescription.trim(),
            status: 'ativo',
            isActive: true,
            selectionType: categorySelectionType,
            minQuantity: parseInt(minQuantity) || 0,
            maxQuantity: parseInt(maxQuantity) || 3,
          })
        } else {
          await createCategory({
            name: categoryName.trim(),
            description: categoryDescription.trim(),
            status: 'ativo',
            isActive: true,
          })
        }
      }
    
    // Resetar estados e fechar modal com animação
    closeModal()
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
    }
  }

  // Função para alternar estado da categoria
  const toggleCategoryState = async (categoryName: string) => {
    const category = firebaseCategories.find(cat => cat.name === categoryName)
    if (!category) return

    const newState = !category.isActive
    const newStatus = newState ? (category.status === 'inativo' ? 'ativo' : category.status) : 'inativo'
    
    try {
      await updateCategory(category.id, {
        isActive: newState,
        status: newStatus as 'ativo' | 'inativo' | 'em-falta'
      })
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
    }
  }

  // Função para duplicar categoria
  const duplicateCategory = async (categoryName: string) => {
    const originalCategory = firebaseCategories.find(cat => cat.name === categoryName)
    if (!originalCategory) return

    const duplicatedName = `${categoryName} - copia`
    
    try {
      await createCategory({
        name: duplicatedName,
        description: originalCategory.description,
        status: originalCategory.status,
        isActive: originalCategory.isActive,
      })
    } catch (error) {
      console.error('Erro ao duplicar categoria:', error)
    }
  }

  // Função para abrir modal de nova categoria com delay
  const openModal = (categoryToEdit?: { id: string; name: string; description: string; status: string; isActive: boolean; selectionType?: string; minQuantity?: number; maxQuantity?: number }) => {
    if (categoryToEdit) {
      // Modo edição
      setIsEditingCategory(true)
      setEditingCategoryId(categoryToEdit.id)
      setCategoryName(categoryToEdit.name)
      setCategoryDescription(categoryToEdit.description)
      setCategoryStatus(categoryToEdit.status as 'ativo' | 'inativo' | 'em-falta')
      setSelectedTemplate(categoryToEdit.isActive ? 'Opcional' : 'Obrigatório')
      
      if (categoryToEdit.selectionType) {
        setCategorySelectionType(categoryToEdit.selectionType as 'unica' | 'multipla' | 'somavel')
      }
      if (categoryToEdit.minQuantity !== undefined) {
        setMinQuantity(categoryToEdit.minQuantity.toString())
      }
      if (categoryToEdit.maxQuantity !== undefined) {
        setMaxQuantity(categoryToEdit.maxQuantity.toString())
      }
    } else {
      // Modo criação
      setIsEditingCategory(false)
      setEditingCategoryId(null)
      setCategoryName('')
      setCategoryDescription('')
      setCategoryStatus('ativo')
      setSelectedTemplate('Opcional')
      setCategorySelectionType('unica')
      setMinQuantity('0')
      setMaxQuantity('3')
    }
    
    setShowModal(true)
    setTimeout(() => setIsModalAnimating(true), 10)
  }

  // Função para fechar modal de nova categoria com animação
  const closeModal = () => {
    setIsModalAnimating(false)
    setTimeout(() => {
      setShowModal(false)
      setCategoryName('')
      setCategoryDescription('')
      setSelectedTemplate('Opcional')
      setIsDropdownOpen(false)
      setNameError('')
      setCategorySelectionType('unica')
      setMinQuantity('0')
      setMaxQuantity('3')
      setIsEditingCategory(false)
      setEditingCategoryId(null)
    }, 400)
  }



  // Função para abrir modal de adicionar adicionais com delay
  const openAddAdditionalsModal = () => {
    // Pré-selecionar adicionais que já estão na lista do produto
    setSelectedAdditionalIds(productAdditionals)
    setShowAddAdditionalsModal(true)
    setShowAddAdditionalsModalContent(false) // Reset do estado do conteúdo
    setTimeout(() => {
      setShowAddAdditionalsModalContent(true)
    }, 150) // Delay para mostrar o modal após o fundo aparecer
  }

  // Função para fechar modal de adicionar adicionais com animação
  const closeAddAdditionalsModal = () => {
    setShowAddAdditionalsModalContent(false) // Primeiro esconde o modal
    setIsClosingAddAdditionalsModal(true)
    setTimeout(() => {
      setShowAddAdditionalsModal(false)
      setIsClosingAddAdditionalsModal(false)
      setSelectedAdditionalIds([]) // Limpar seleções
    }, 400)
  }

  // Função para salvar produto
  const handleSaveProduct = async () => {
    // Validar se pelo menos o nome foi preenchido
    if (!productName.trim()) {
      alert('Nome do produto é obrigatório')
      return
    }

    // Validar se existem categorias
    if (firebaseCategories.length === 0) {
      alert('É necessário criar pelo menos uma categoria antes de adicionar produtos')
      return
    }

    try {
            // Criar novo produto no Firebase
      await createProduct({
      name: productName.trim(),
      description: productDescription.trim(),
      category: selectedProductCategory,
      price: productPrice,
      imageUrl: productImageUrl,
      portionSize: portionSize,
      portionUnit: portionUnit,
      servesUpTo: servesUpTo,
      status: categoryStatus,
        isActive: isProductActive,
        additionals: productAdditionals
      })

    // Resetar formulário e voltar para lista
    resetProductForm()
    setShowNewProductArea(false)
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    }
  }

  // Função para salvar adicional
  const handleSaveAdditional = async () => {
    // Validar se pelo menos o nome foi preenchido
    if (!additionalName.trim()) {
      alert('Nome do adicional é obrigatório')
      return
    }

    // Validar se existem categorias de adicionais
    if (firebaseAdditionalCategories.length === 0) {
      alert('É necessário criar pelo menos uma categoria de adicional antes de adicionar adicionais')
      return
    }

    try {
      // Criar novo adicional no Firebase
      await createAdditional({
      name: additionalName.trim(),
      description: additionalDescription.trim(),
      category: selectedAdditionalCategory,
      price: additionalPrice,
      imageUrl: additionalImageUrl,
        portionSize: '',
        portionUnit: '',
        servesUpTo: '',
      status: categoryStatus,
        isActive: isProductActive
      })

    // Resetar formulário e voltar para lista
    resetAdditionalForm()
    setShowNewAdditionalArea(false)
    } catch (error) {
      console.error('Erro ao salvar adicional:', error)
    }
  }

  // Função para salvar edição de produto
  const handleSaveEditProduct = async () => {
    if (!editingProductId || !productName.trim()) {
      alert('Nome do produto é obrigatório')
      return
    }

    // Validar se existem categorias
    if (firebaseCategories.length === 0) {
      alert('É necessário ter pelo menos uma categoria para editar produtos')
      return
    }

    try {
            // Atualizar produto no Firebase
      await updateProduct(editingProductId, {
              name: productName.trim(),
              description: productDescription.trim(),
              category: selectedProductCategory,
              price: productPrice,
              imageUrl: productImageUrl,
              portionSize: portionSize,
              portionUnit: portionUnit,
              servesUpTo: servesUpTo,
              status: categoryStatus,
        isActive: isProductActive,
        additionals: productAdditionals
      })

    // Resetar estados e voltar para lista
    resetProductForm()
    setEditingProductId(null)
    setShowEditProductArea(false)
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
    }
  }

  // Função para salvar edição de adicional
  const handleSaveEditAdditional = async () => {
    if (!editingAdditionalId || !additionalName.trim()) {
      alert('Nome do adicional é obrigatório')
      return
    }

    // Validar se existem categorias de adicionais
    if (firebaseAdditionalCategories.length === 0) {
      alert('É necessário ter pelo menos uma categoria de adicional para editar adicionais')
      return
    }

    try {
      // Atualizar adicional no Firebase
      await updateAdditional(editingAdditionalId, {
              name: additionalName.trim(),
              description: additionalDescription.trim(),
              category: selectedAdditionalCategory,
              price: additionalPrice,
              imageUrl: additionalImageUrl,
        portionSize: '',
        portionUnit: '',
        servesUpTo: '',
              status: categoryStatus,
              isActive: isProductActive
      })

    // Resetar estados e voltar para lista
    resetAdditionalForm()
    setEditingAdditionalId(null)
    setShowEditAdditionalArea(false)
    } catch (error) {
      console.error('Erro ao atualizar adicional:', error)
    }
  }

  // Função para resetar formulário de produto
  const resetProductForm = () => {
    setProductName('')
    setProductDescription('')
    setSelectedProductCategory('Todas as categorias')
    setProductPrice('R$ 0,00')
    setProductImageUrl('/product-placeholder.jpg')
    setPortionSize('')
    setPortionUnit('')
    setServesUpTo('')
    setCategoryStatus('ativo')
    setIsProductActive(true)
    setProductAdditionals([])
  }

  // Função para resetar formulário de adicional
  const resetAdditionalForm = () => {
    setAdditionalName('')
    setAdditionalDescription('')
    if (firebaseAdditionalCategories.length > 0) {
      setSelectedAdditionalCategory(firebaseAdditionalCategories[0].name)
    } else {
      setSelectedAdditionalCategory('')
    }
    setAdditionalPrice('R$ 0,00')
    setAdditionalImageUrl('/product-placeholder.jpg')
    setCategoryStatus('ativo')
    setIsProductActive(true)
  }

  // Função para alternar estado ativo/inativo de produto salvo
  const toggleSavedProductState = async (productId: string) => {
    const product = savedProducts.find(p => p.id === productId)
    if (!product) return

    try {
      await updateProduct(productId, {
        isActive: !product.isActive
      })
    } catch (error) {
      console.error('Erro ao atualizar estado do produto:', error)
    }
  }

  // Função para alternar estado ativo/inativo de adicional salvo
  const toggleSavedAdditionalState = async (additionalId: string) => {
    const additional = savedAdditionals.find(a => a.id === additionalId)
    if (!additional) return

    try {
      await updateAdditional(additionalId, {
        isActive: !additional.isActive
      })
    } catch (error) {
      console.error('Erro ao atualizar estado do adicional:', error)
    }
  }

  // Função para abrir edição de produto
  const openEditProduct = (productId: string) => {
    const product = savedProducts.find(p => p.id === productId)
    if (product) {
      // Preencher formulário com dados do produto
      setProductName(product.name)
      setProductDescription(product.description)
      setSelectedProductCategory(product.category)
      setProductPrice(product.price)
      setProductImageUrl(product.imageUrl)
      setPortionSize(product.portionSize)
      setPortionUnit(product.portionUnit)
      setServesUpTo(product.servesUpTo)
      setCategoryStatus(product.status)
      setIsProductActive(product.isActive)
      setProductAdditionals(product.additionals || [])
      
      // Definir ID do produto sendo editado
      setEditingProductId(productId)
      
      // Abrir área de edição
      setShowEditProductArea(true)
    }
  }

  // Função para abrir edição de adicional
  const openEditAdditional = (additionalId: string) => {
    const additional = savedAdditionals.find(a => a.id === additionalId)
    if (additional) {
      // Preencher formulário com dados do adicional
      setAdditionalName(additional.name)
      setAdditionalDescription(additional.description)
      setSelectedAdditionalCategory(additional.category)
      setAdditionalPrice(additional.price)
      setAdditionalImageUrl(additional.imageUrl)
      setCategoryStatus(additional.status)
      setIsProductActive(additional.isActive)
      
      // Definir ID do adicional sendo editado
      setEditingAdditionalId(additionalId)
      
      // Abrir área de edição
      setShowEditAdditionalArea(true)
    }
  }

  // Função para alternar estado do adicional
  const toggleAdditionalState = async (additionalName: string) => {
    const additionalCategory = firebaseAdditionalCategories.find(cat => cat.name === additionalName)
    if (!additionalCategory) return

    const newState = !additionalCategory.isActive
    const newStatus = newState ? (additionalCategory.status === 'inativo' ? 'ativo' : additionalCategory.status) : 'inativo'
    
    try {
      await updateAdditionalCategory(additionalCategory.id, {
        isActive: newState,
        status: newStatus as 'ativo' | 'inativo' | 'em-falta'
      })
    } catch (error) {
      console.error('Erro ao atualizar categoria de adicional:', error)
    }
  }

  // Função para duplicar adicional
  const duplicateAdditional = async (additionalName: string) => {
    const originalAdditionalCategory = firebaseAdditionalCategories.find(cat => cat.name === additionalName)
    if (!originalAdditionalCategory) return

    const duplicatedName = `${additionalName} - copia`
    
    try {
      await createAdditionalCategory({
        name: duplicatedName,
        description: originalAdditionalCategory.description,
        status: originalAdditionalCategory.status,
        isActive: originalAdditionalCategory.isActive,
        selectionType: originalAdditionalCategory.selectionType || 'unica',
        minQuantity: originalAdditionalCategory.minQuantity || 0,
        maxQuantity: originalAdditionalCategory.maxQuantity || 3,
      })
    } catch (error) {
      console.error('Erro ao duplicar categoria de adicional:', error)
    }
  }

  // Função para deletar categoria
  const handleDeleteCategory = async (categoryName: string) => {
    if (!categoryName) return
    
    const category = firebaseCategories.find(cat => cat.name === categoryName)
    if (!category) return

    const confirmDelete = window.confirm(`Tem certeza que deseja deletar a categoria "${categoryName}"?`)
    if (!confirmDelete) return

    try {
      await deleteCategory(category.id)
      
      // Se a categoria deletada era a ativa, selecionar a primeira disponível
      if (activeCategory === categoryName) {
        const remainingCategories = firebaseCategories.filter(cat => cat.id !== category.id)
        if (remainingCategories.length > 0) {
          setActiveCategory(remainingCategories[0].name)
          setSelectedCategoryInList(remainingCategories[0].name)
          } else {
          setActiveCategory('')
          setSelectedCategoryInList('')
        }
      }
      
      // Se a categoria deletada era a selecionada no produto, limpar seleção
      if (selectedProductCategory === categoryName) {
        const remainingCategories = firebaseCategories.filter(cat => cat.id !== category.id)
        if (remainingCategories.length > 0) {
          setSelectedProductCategory(remainingCategories[0].name)
      } else {
          setSelectedProductCategory('')
        }
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
    }
  }

  // Função para deletar categoria de adicional
  const handleDeleteAdditionalCategory = async (additionalName: string) => {
    if (!additionalName) return
    
    const additionalCategory = firebaseAdditionalCategories.find(cat => cat.name === additionalName)
    if (!additionalCategory) return

    const confirmDelete = window.confirm(`Tem certeza que deseja deletar a categoria de adicional "${additionalName}"?`)
    if (!confirmDelete) return

    try {
      await deleteAdditionalCategory(additionalCategory.id)
      
      // Se a categoria deletada era a selecionada, limpar seleção
      if (selectedAdditional === additionalName) {
        const remainingCategories = firebaseAdditionalCategories.filter(cat => cat.id !== additionalCategory.id)
        if (remainingCategories.length > 0) {
          setSelectedAdditional(remainingCategories[0].name)
      } else {
          setSelectedAdditional('')
        }
      }
    } catch (error) {
      console.error('Erro ao deletar categoria de adicional:', error)
    }
  }

  // Função para deletar produto
  const handleDeleteProduct = async (productId: string) => {
    const product = savedProducts.find(p => p.id === productId)
    if (!product) return

    const confirmDelete = window.confirm(`Tem certeza que deseja deletar o produto "${product.name}"?`)
    if (!confirmDelete) return

    try {
      await deleteProduct(productId)
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
    }
  }

  // Função para deletar adicional
  const handleDeleteAdditional = async (additionalId: string) => {
    const additional = savedAdditionals.find(a => a.id === additionalId)
    if (!additional) return

    const confirmDelete = window.confirm(`Tem certeza que deseja deletar o adicional "${additional.name}"?`)
    if (!confirmDelete) return

    try {
      await deleteAdditional(additionalId)
    } catch (error) {
      console.error('Erro ao deletar adicional:', error)
    }
  }



  // Mapear produtos por categoria
  const getProductName = () => {
    // Se estamos no modo adicionais e há um adicional selecionado
    if (activeFilterButton === 'Adicionais' && selectedAdditional) {
      return selectedAdditional
    }
    
    // Modo categorias normal
    switch (activeCategory) {
      case 'Hamburguers':
        return 'X-tudo'
      case 'Bebidas':
        return 'Coca Cola 350ml'
      case 'Sobremesas':
        return 'Brownie'
      default:
        return 'Nome do produto'
    }
  }

  // Função para mudar categoria com loading
  const handleCategoryChange = (newCategory: string) => {
    if (newCategory !== activeCategory) {
      setIsLoadingImage(true)
      setActiveCategory(newCategory)
      setSelectedCategoryInList(newCategory)
      setTimeout(() => {
        setIsLoadingImage(false)
      }, 1500)
    }
  }

  // Função para formatar texto pessoa/pessoas
  const formatPersonText = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value
    if (numValue === 0 || value === '') return 'pessoas'
    return numValue === 1 ? 'pessoa' : 'pessoas'
  }

  // Função para contar produtos por categoria
  const getProductCountByCategory = (categoryName: string) => {
    return savedProducts.filter(product => product.category === categoryName).length
  }

  // Função para contar adicionais por categoria
  const getAdditionalCountByCategory = (categoryName: string) => {
    return savedAdditionals.filter(additional => additional.category === categoryName).length
  }

  // Função para mudar adicional com loading
  const handleAdditionalChange = (newAdditional: string) => {
    if (newAdditional !== selectedAdditional) {
      setIsLoadingImage(true)
      setSelectedAdditional(newAdditional)
      setTimeout(() => {
        setIsLoadingImage(false)
      }, 1500)
    }
  }

  // Função para formatar preço em moeda brasileira
  const formatPrice = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '')
    
    // Se vazio, retorna R$ 0,00
    if (!numbers) return 'R$ 0,00'
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseInt(numbers) / 100
    
    // Formata em moeda brasileira
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  // Função para lidar com mudança no preço
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value)
    setProductPrice(formatted)
  }

  // Função para lidar com mudança no preço do adicional
  const handleAdditionalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value)
    setAdditionalPrice(formatted)
  }

  // Função para lidar com upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Detectar se é upload para adicional ou produto baseado no ID
      const isAdditionalUpload = event.target.id === 'additional-image-upload'
      setUploadingForAdditional(isAdditionalUpload)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImageToCrop(result)
        // Reset do crop para valores padrão
        setCropSize({ width: 210, height: 210 })
        setCropPosition({ x: 45, y: 45 })
        setImageDimensions({ width: 400, height: 400 })
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)
    }
    // Reset do input para permitir selecionar a mesma imagem novamente
    event.target.value = ''
  }

  // Função para confirmar o crop da imagem
  const handleCropConfirm = () => {
    // Criar canvas para fazer o crop real da imagem
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Definir tamanho do canvas como o tamanho do crop
      canvas.width = cropSize.width
      canvas.height = cropSize.height
      
      // Calcular a escala entre a imagem original e a imagem exibida
      const displayedImg = document.querySelector('#crop-image') as HTMLImageElement
      const scaleX = img.naturalWidth / displayedImg.offsetWidth
      const scaleY = img.naturalHeight / displayedImg.offsetHeight
      
      // Calcular as coordenadas reais na imagem original
      const sourceX = cropPosition.x * scaleX
      const sourceY = cropPosition.y * scaleY
      const sourceWidth = cropSize.width * scaleX
      const sourceHeight = cropSize.height * scaleY
      
      // Desenhar apenas a área recortada no canvas
      ctx?.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight, // Área de origem
        0, 0, cropSize.width, cropSize.height // Área de destino
      )
      
      // Converter canvas para data URL e aplicar como imagem correta
      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9)
      
      if (uploadingForAdditional) {
        setAdditionalImageUrl(croppedImageUrl)
      } else {
      setProductImageUrl(croppedImageUrl)
      }
      
      // Fechar modal e resetar estado
      setShowCropModal(false)
      setImageToCrop('')
      setUploadingForAdditional(false)
    }
    
    img.src = imageToCrop
  }

  // Função para cancelar o crop
  const handleCropCancel = () => {
    setShowCropModal(false)
    setImageToCrop('')
    setUploadingForAdditional(false)
    setCropPosition({ x: 45, y: 45 }) // Reset da posição
    setCropSize({ width: 210, height: 210 }) // Reset do tamanho
  }

  // Funções para controlar o drag do crop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - cropPosition.x,
      y: e.clientY - cropPosition.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Limitar movimento dentro da área da imagem
      const maxX = imageDimensions.width - cropSize.width
      const maxY = imageDimensions.height - cropSize.height
      
      setCropPosition({
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      })
    } else if (isResizing) {
      const currentMouseX = e.clientX
      const currentMouseY = e.clientY
      
      const containerRect = e.currentTarget.getBoundingClientRect()
      const relativeX = currentMouseX - containerRect.left
      const relativeY = currentMouseY - containerRect.top
      
      let newWidth = cropSize.width
      let newHeight = cropSize.height
      let newX = cropPosition.x
      let newY = cropPosition.y
      
             // Redimensionamento sempre quadrado
       let newSize = cropSize.width
       const centerX = newX + newWidth / 2
       const centerY = newY + newHeight / 2
       
       switch (resizeDirection) {
         case 'right':
         case 'left':
           newSize = Math.max(50, Math.abs(relativeX - centerX) * 2)
           break
         case 'bottom':
         case 'top':
           newSize = Math.max(50, Math.abs(relativeY - centerY) * 2)
           break
         case 'topleft':
         case 'topright':
         case 'bottomleft':
         case 'bottomright':
           const deltaX = Math.abs(relativeX - centerX)
           const deltaY = Math.abs(relativeY - centerY)
           newSize = Math.max(50, Math.max(deltaX, deltaY) * 2)
           break

       }
       
       // Limitar o tamanho para caber na imagem
       const maxSize = Math.min(
         imageDimensions.width,
         imageDimensions.height
       )
       newSize = Math.min(newSize, maxSize)
       
               // Ajustar posição para manter centralizado
        newX = Math.max(0, Math.min(imageDimensions.width - newSize, centerX - newSize / 2))
        newY = Math.max(0, Math.min(imageDimensions.height - newSize, centerY - newSize / 2))
        
        newWidth = newSize
        newHeight = newSize
      
      setCropSize({ width: newWidth, height: newHeight })
      setCropPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection('')
  }

  // Função para iniciar redimensionamento
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // Função para criar efeito ripple
  const createRipple = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>, callback: () => void) => {
    const button = e.currentTarget
    
    // Garantir que o botão tenha position relative para conter o ripple
    if (getComputedStyle(button).position === 'static') {
      button.style.position = 'relative'
    }
    
    const ripple = document.createElement('div')
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(156, 163, 175, 0.4);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    `
    
    // Adiciona o CSS da animação se não existir
    if (!document.querySelector('#ripple-style')) {
      const style = document.createElement('style')
      style.id = 'ripple-style'
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
    }
    
    button.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
    callback()
  }

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen" style={{ backgroundColor: '#ececec' }}>
      {/* Main Content */}
      <div className="flex-1" style={{ padding: '32px' }}>
        <div className="flex" style={{ gap: '16px', maxWidth: '100%', alignItems: 'flex-start' }}>
                    {/* Caixa de Categorias / Adicionais */}
          <div 
            className="bg-white rounded-lg p-4"
            style={{ 
              width: '357px',
              maxWidth: '357px',
              minWidth: '300px',
              height: 'fit-content',
              overflow: 'visible',
              flexShrink: 0
            }}
          >
            {activeFilterButton === 'Adicionais' ? (
              // Conteúdo de Adicionais
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-gray-700 font-medium" style={{ fontSize: '16px' }}>Categoria de adicionais</h2>
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 text-sm font-medium transition-colors flex items-center"
                    style={{ 
                      backgroundColor: '#542583', 
                      height: '40px',
                      borderRadius: '100px'
                    }}
                    onClick={() => openModal()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                      <path d="M440-120v-320H120v-80h320v-320h80v320h320v80H520v320h-80Z"/>
                    </svg> 
                    <span style={{ marginLeft: '8px' }}>Nova categoria</span>
                  </button>
                </div>
                
                {/* Lista dinâmica de adicionais */}
                <div style={{ marginTop: '24px' }}>
                  {additionalCategories.map((additional, index) => (
                    <div className="relative mb-4" style={{ overflow: 'visible' }} key={additional}>
                      <div 
                        data-additional={additional}
                        className="border border-gray-300 flex items-center justify-between w-full hover:bg-gray-50 transition-colors relative cursor-pointer"
                        style={{ 
                          minHeight: '50px',
                          borderRadius: '4px',
                          padding: '12px 0',
                          height: 'auto',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onClick={(e) => createRipple(e, () => handleAdditionalChange(additional))}
                      >
                        <div className="flex items-center ml-4 flex-1 py-1">
                          <div className="grid grid-cols-2 gap-0.5 mr-6 cursor-move">
                            {Array.from({ length: 10 }).map((_, dotIndex) => (
                              <div 
                                key={dotIndex}
                                className="w-0.5 h-0.5 bg-gray-400 rounded-full"
                              ></div>
                            ))}
                          </div>
                          
                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2 mr-4">
                            <button
                              className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none"
                              style={{ backgroundColor: additionalStates[additional] ? '#542583' : '#d1d5db' }}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleAdditionalState(additional)
                              }}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-in-out ${
                                  additionalStates[additional] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          
                          <div className="flex flex-col gap-1 flex-1">
                            <span 
                              className="font-medium text-left" 
                              style={{ 
                                fontSize: '16px',
                                color: selectedAdditional === additional ? '#542583' : '#374151',
                                lineHeight: '1.3',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                                display: 'block',
                                maxWidth: '100%'
                              }}
                            >
                              {additional}
                            </span>
                            {(!additionalStates[additional] || additionalStatuses[additional] === 'em-falta') && (
                              <span 
                                className="text-gray-500 text-sm text-left"
                                style={{ fontSize: '14px' }}
                              >
                                {additionalStatuses[additional] === 'em-falta' ? '(em falta)' : '(inativo)'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mr-4 self-center">
                          <button 
                            className="text-gray-400 hover:text-gray-600 cursor-pointer flex items-center justify-center relative overflow-hidden"
                            style={{ 
                              padding: '8px 12px',
                              margin: '-8px -12px',
                              borderRadius: '4px',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              createRipple(e, () => {
                                setOpenMenuCategory(openMenuCategory === additional ? null : additional)
                              })
                            }}
                          >
                            <span style={{ fontSize: '24px', lineHeight: '1' }}>⋮</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dropdown Menu para Adicionais */}
                {openMenuCategory && (
                  <div 
                    ref={menuRef}
                    className="fixed bg-white border border-gray-300 rounded shadow-lg min-w-32 animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{ 
                      zIndex: 99999,
                      left: `${(document.querySelector(`[data-additional="${openMenuCategory}"]`) as HTMLElement)?.getBoundingClientRect().right - 120 || 0}px`,
                      top: `${(document.querySelector(`[data-additional="${openMenuCategory}"]`) as HTMLElement)?.getBoundingClientRect().bottom + 8 || 0}px`
                    }}
                  >
                                        {/* Editar */}
                    <button 
                      className="w-full text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors duration-150"
                      style={{ 
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                                           onClick={(e) => {
                       e.stopPropagation()
                       setOpenMenuCategory(null)
                       // Encontrar a categoria de adicional para editar
                       const additionalCategory = firebaseAdditionalCategories.find(cat => cat.name === openMenuCategory)
                       if (additionalCategory) {
                         openModal({
                           id: additionalCategory.id,
                           name: additionalCategory.name,
                           description: additionalCategory.description,
                           status: additionalCategory.status,
                           isActive: additionalCategory.isActive,
                           selectionType: additionalCategory.selectionType,
                           minQuantity: additionalCategory.minQuantity,
                           maxQuantity: additionalCategory.maxQuantity
                         })
                       }
                     }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                        <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
                      </svg>
                      Editar
                    </button>
                    
                    {/* Duplicar */}
                    <button 
                      className="w-full text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors duration-150"
                      style={{ 
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuCategory(null)
                        duplicateAdditional(openMenuCategory)
                      }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Duplicar
                    </button>
                    
                    {/* Deletar */}
                    <button 
                      className="w-full text-left hover:bg-gray-50 flex items-center gap-2 text-red-600 transition-colors duration-150"
                      style={{ 
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuCategory(null)
                        handleDeleteAdditionalCategory(openMenuCategory!)
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                      </svg>
                      Deletar
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Conteúdo de Categorias
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-gray-700 font-medium" style={{ fontSize: '16px' }}>Categorias</h2>
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 text-sm font-medium transition-colors flex items-center"
                    style={{ 
                      backgroundColor: '#542583', 
                      height: '40px',
                      borderRadius: '100px'
                    }}
                    onClick={() => openModal()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                      <path d="M440-120v-320H120v-80h320v-320h80v320h320v80H520v320h-80Z"/>
                    </svg> 
                    <span style={{ marginLeft: '8px' }}>Nova categoria</span>
                  </button>
                </div>
                
                {/* Lista dinâmica de categorias */}
                <div style={{ marginTop: '24px' }}>
                  {categories.map((category, index) => (
                    <div 
                      key={category}
                      data-category={category}
                      className="border border-gray-300 flex items-center justify-between mb-4 w-full hover:bg-gray-50 transition-colors relative cursor-pointer"
                      style={{ 
                        minHeight: '50px',
                        borderRadius: '4px',
                        padding: '12px 0',
                        height: 'auto',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={(e) => createRipple(e, () => handleCategoryChange(category))}
                    >
                      <div className="flex items-center ml-4 flex-1 py-1">
                        <div className="grid grid-cols-2 gap-0.5 mr-6 cursor-move">
                          {Array.from({ length: 10 }).map((_, dotIndex) => (
                            <div 
                              key={dotIndex}
                              className="w-0.5 h-0.5 bg-gray-400 rounded-full"
                            ></div>
                          ))}
                        </div>
                        
                        {/* Toggle Switch */}
                        <div className="flex items-center gap-2 mr-4">
                          <button
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none"
                            style={{ backgroundColor: categoryStates[category] ? '#542583' : '#d1d5db' }}
                            onClick={(e) => {
                              e.stopPropagation() // Impede que o clique no toggle selecione a categoria
                              toggleCategoryState(category)
                            }}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-in-out ${
                                categoryStates[category] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        
                        <div className="flex flex-col gap-1 flex-1">
                          <span 
                            className="font-medium text-left" 
                            style={{ 
                              fontSize: '16px',
                              color: selectedCategoryInList === category ? '#542583' : '#374151',
                              lineHeight: '1.3',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal',
                              display: 'block',
                              maxWidth: '100%'
                            }}
                          >
                            {category}
                          </span>
                          {(!categoryStates[category] || categoryStatuses[category] === 'em-falta') && (
                            <span 
                              className="text-gray-500 text-sm text-left"
                              style={{ fontSize: '14px' }}
                            >
                              {categoryStatuses[category] === 'em-falta' ? '(em falta)' : '(inativo)'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mr-4 self-center">
                        <button 
                          className="text-gray-400 hover:text-gray-600 cursor-pointer flex items-center justify-center relative overflow-hidden"
                          style={{ 
                            padding: '8px 12px',
                            margin: '-8px -12px',
                            borderRadius: '4px',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            createRipple(e, () => {
                              setOpenMenuCategory(openMenuCategory === category ? null : category)
                            })
                          }}
                        >
                          <span style={{ fontSize: '24px', lineHeight: '1' }}>⋮</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dropdown Menu - Renderizado fora do loop para evitar overflow */}
                {openMenuCategory && activeFilterButton !== 'Adicionais' && (
                  <div 
                    ref={menuRef}
                    className="fixed bg-white border border-gray-300 rounded shadow-lg min-w-32 animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{ 
                      zIndex: 99999,
                      left: `${(document.querySelector(`[data-category="${openMenuCategory}"]`) as HTMLElement)?.getBoundingClientRect().right - 120 || 0}px`,
                      top: `${(document.querySelector(`[data-category="${openMenuCategory}"]`) as HTMLElement)?.getBoundingClientRect().bottom + 8 || 0}px`
                    }}
                  >
                                        {/* Editar */}
                    <button 
                      className="w-full text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors duration-150"
                      style={{ 
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuCategory(null)
                        // Encontrar a categoria normal para editar
                        const category = firebaseCategories.find(cat => cat.name === openMenuCategory)
                        if (category) {
                          openModal({
                            id: category.id,
                            name: category.name,
                            description: category.description,
                            status: category.status,
                            isActive: category.isActive
                          })
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                        <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
                      </svg>
                      Editar
                    </button>
                    
                    {/* Duplicar */}
                    <button 
                      className="w-full text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors duration-150"
                      style={{ 
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuCategory(null)
                        duplicateCategory(openMenuCategory)
                      }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Duplicar
                    </button>
                    
                    {/* Deletar */}
                    <button 
                      className="w-full text-left hover:bg-gray-50 flex items-center gap-2 text-red-600 transition-colors duration-150"
                      style={{ 
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuCategory(null)
                        handleDeleteCategory(openMenuCategory!)
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                      </svg>
                      Deletar
                    </button>
                  </div>
                )}


              </>
            )}
          </div>



          {/* Caixa em Branco da Direita */}
          <div 
            className="bg-white rounded-lg p-4"
            style={{ 
              width: 'calc(100% - 373px)',
              maxWidth: 'calc(100% - 373px)',
              minWidth: '500px',
              minHeight: '200px',
              height: 'fit-content'
            }}
          >
            {showNewProductArea || showEditProductArea ? (
              /* Área totalmente vazia para novo produto */
              <div 
                className="w-full relative" 
                style={{ 
                  minHeight: '100%',
                  height: `${contentHeight}px`
                }}
              >
                {/* Botão Voltar no canto superior esquerdo */}
                <button 
                  className="absolute top-0 left-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#542583' }}
                  onClick={() => {
                    if (showEditProductArea) {
                      resetProductForm()
                      setEditingProductId(null)
                      setShowEditProductArea(false)
                    } else {
                      setShowNewProductArea(false)
                    }
                  }}
                >
                  Voltar
                </button>
                
                {/* Botão Salvar no canto superior direito */}
                <button 
                  className="absolute top-0 right-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#542583' }}
                  onClick={showEditProductArea ? handleSaveEditProduct : handleSaveProduct}
                >
                  Salvar
                </button>
                
                {/* Título embaixo do botão */}
                <h2 
                  className="absolute text-gray-700 font-medium"
                  style={{ 
                    top: '60px', 
                    left: '0px',
                    fontSize: '16px'
                  }}
                >
                  {showEditProductArea ? 'Editar produto' : 'Informações do produto'}
                </h2>
                
                {/* Botões de Status */}
                <div 
                  className="absolute flex gap-3"
                  style={{ 
                    top: '100px', 
                    left: '0px'
                  }}
                >
                  {/* Ativo */}
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      isProductActive && categoryStatus === 'ativo'
                        ? 'shadow-sm'
                        : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: isProductActive && categoryStatus === 'ativo' ? '#f3e8ff' : 'transparent',
                      color: isProductActive && categoryStatus === 'ativo' ? '#542583' : undefined
                    }}
                    onClick={() => {
                      setIsProductActive(true)
                      setCategoryStatus('ativo')
                    }}
                  >
                    Ativo
                  </button>

                  {/* Inativo */}
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      !isProductActive && categoryStatus === 'inativo'
                        ? 'shadow-sm'
                        : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: !isProductActive && categoryStatus === 'inativo' ? '#f3e8ff' : 'transparent',
                      color: !isProductActive && categoryStatus === 'inativo' ? '#542583' : undefined
                    }}
                    onClick={() => {
                      setIsProductActive(false)
                      setCategoryStatus('inativo')
                    }}
                  >
                    Inativo
                  </button>

                  {/* Em falta */}
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      categoryStatus === 'em-falta'
                        ? 'shadow-sm'
                        : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: categoryStatus === 'em-falta' ? '#f3e8ff' : 'transparent',
                      color: categoryStatus === 'em-falta' ? '#542583' : undefined
                    }}
                    onClick={() => {
                      setIsProductActive(true)
                      setCategoryStatus('em-falta')
                    }}
                  >
                    Em falta
                  </button>
                </div>
                
                {/* Campo Nome do Produto */}
                <div 
                  className="absolute"
                  style={{ 
                    top: '170px', 
                    left: '0px',
                    width: '100%',
                    maxWidth: '410px',
                    right: '0px'
                  }}
                >
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                    Nome do produto
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Digite o nome do produto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    style={{
                      height: '40px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                {/* Campo Descrição do Produto */}
                <div 
                  className="absolute"
                  style={{ 
                    top: '250px', 
                    left: '0px',
                    width: '100%',
                    maxWidth: '410px',
                    right: '0px'
                  }}
                >
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                    Descrição do produto
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Digite a descrição do produto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none [&::-webkit-scrollbar]:hidden"
                    style={{
                      minHeight: '80px',
                      fontSize: '16px',
                      lineHeight: '1.5',
                      overflow: 'hidden',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      const newHeight = Math.max(80, target.scrollHeight)
                      target.style.height = newHeight + 'px'
                      
                      // Calcular nova altura do conteúdo baseada na posição do textarea + sua altura + categoria + preço + quantidade + linha + botão + margem
                      const textareaTop = 250 // posição do textarea
                      const textareaHeight = newHeight
                      const categoryFieldHeight = 100 // categoria do produto + label + espaçamento extra
                      const priceFieldHeight = 80 // preço do produto + label + espaçamento
                      const quantityFieldHeight = 100 // caixas de quantidade + label + espaçamento extra
                      const dividerHeight = 30 // linha divisória + espaçamento
                      const additionalsButtonHeight = 60 // botão adicionar adicionais + espaçamento
                      const bottomMargin = 50 // margem inferior
                      const newContentHeight = Math.max(740, textareaTop + textareaHeight + categoryFieldHeight + priceFieldHeight + quantityFieldHeight + dividerHeight + additionalsButtonHeight + bottomMargin)
                      setContentHeight(newContentHeight)
                    }}
                  />
                </div>
                
                {/* Campo Categoria do Produto */}
                <div 
                  className="absolute"
                  style={{ 
                    top: '380px', 
                    left: '0px',
                    width: '100%',
                    maxWidth: '410px',
                    right: '0px'
                  }}
                >
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                    Categoria do produto
                  </label>
                  <div className="relative" ref={productCategoryDropdownRef}>
                    <button
                      className="w-full h-10 px-3 border border-gray-300 rounded bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onClick={() => setIsProductCategoryDropdownOpen(!isProductCategoryDropdownOpen)}
                    >
                      <span className="text-gray-900">{selectedProductCategory}</span>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isProductCategoryDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown menu */}
                    {isProductCategoryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
                        {/* Categorias dinâmicas */}
                        {categories.map((category) => (
                          <div 
                            key={category}
                            className="px-3 py-2 hover:bg-purple-50 cursor-pointer"
                            style={{ 
                              backgroundColor: selectedProductCategory === category ? '#f3e8ff' : 'transparent',
                              color: selectedProductCategory === category ? '#542583' : '#374151'
                            }}
                            onClick={() => {
                              setSelectedProductCategory(category)
                              setIsProductCategoryDropdownOpen(false)
                            }}
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Campo Preço do Produto */}
                <div 
                  className="absolute"
                  style={{ 
                    top: '460px', 
                    left: '0px',
                    width: '200px'
                  }}
                >
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                    Preço
                  </label>
                  <input
                    type="text"
                    value={productPrice}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    style={{
                      height: '40px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                {/* Caixas de Quantidade */}
                <div 
                  className="absolute flex gap-4"
                  style={{ 
                    top: '540px', 
                    left: '0px'
                  }}
                >
                  {/* Tamanho da porção */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                      Tamanho da porção
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={portionSize}
                        onChange={(e) => setPortionSize(e.target.value)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                        style={{
                          height: '40px',
                          fontSize: '16px'
                        }}
                        min="0"
                        placeholder=""
                      />
                      <div className="relative" ref={portionUnitDropdownRef}>
                        <button
                          className="w-16 h-10 px-3 border border-gray-300 rounded bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          onClick={() => setIsPortionUnitDropdownOpen(!isPortionUnitDropdownOpen)}
                        >
                          <span className="text-gray-900">{portionUnit || ''}</span>
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform ${isPortionUnitDropdownOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {/* Dropdown menu */}
                        {isPortionUnitDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
                            <div 
                              className="px-3 py-2 hover:bg-purple-50 cursor-pointer"
                              style={{ 
                                backgroundColor: portionUnit === 'g' ? '#f3e8ff' : 'transparent',
                                color: portionUnit === 'g' ? '#542583' : '#374151'
                              }}
                                                             onClick={() => {
                                 setPortionUnit('g')
                                 setIsPortionUnitDropdownOpen(false)
                               }}
                            >
                              g
                            </div>
                            <div 
                              className="px-3 py-2 hover:bg-purple-50 cursor-pointer"
                              style={{ 
                                backgroundColor: portionUnit === 'kg' ? '#f3e8ff' : 'transparent',
                                color: portionUnit === 'kg' ? '#542583' : '#374151'
                              }}
                                                             onClick={() => {
                                 setPortionUnit('kg')
                                 setIsPortionUnitDropdownOpen(false)
                               }}
                            >
                              kg
                            </div>
                            <div 
                              className="px-3 py-2 hover:bg-purple-50 cursor-pointer"
                              style={{ 
                                backgroundColor: portionUnit === 'ml' ? '#f3e8ff' : 'transparent',
                                color: portionUnit === 'ml' ? '#542583' : '#374151'
                              }}
                                                             onClick={() => {
                                 setPortionUnit('ml')
                                 setIsPortionUnitDropdownOpen(false)
                               }}
                            >
                              ml
                            </div>
                            <div 
                              className="px-3 py-2 hover:bg-purple-50 cursor-pointer"
                              style={{ 
                                backgroundColor: portionUnit === 'l' ? '#f3e8ff' : 'transparent',
                                color: portionUnit === 'l' ? '#542583' : '#374151'
                              }}
                                                             onClick={() => {
                                 setPortionUnit('l')
                                 setIsPortionUnitDropdownOpen(false)
                               }}
                            >
                              l
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Serve até */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                      Serve até
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={servesUpTo}
                        onChange={(e) => setServesUpTo(e.target.value)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                        style={{
                          height: '40px',
                          fontSize: '16px'
                        }}
                        min="0"
                        placeholder=""
                      />
                      <span 
                        className="text-gray-700"
                        style={{ 
                          fontSize: '16px',
                          minWidth: '70px'
                        }}
                      >
                        {formatPersonText(servesUpTo)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Linha Divisória */}
                <div 
                  className="absolute border-t border-gray-300"
                  style={{ 
                    top: '640px', 
                    left: '0px',
                    right: '0px'
                  }}
                ></div>

                {/* Botão Adicionar Adicionais */}
                <div 
                  className="absolute"
                  style={{ 
                    top: '670px', 
                    left: '0px',
                    right: '0px'
                  }}
                >
                  <button 
                    className="w-full h-12 border-2 border-dashed rounded-md flex items-center justify-center transition-all duration-200 hover:shadow-sm"
                    style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      borderColor: '#542583',
                      color: '#542583'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3e8ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    onClick={() => {
                      openAddAdditionalsModal()
                    }}
                  >
                    <span className="text-xl font-bold mr-2">+</span>
                    adicionar adicionais
                  </button>
                </div>

                {/* Lista de Adicionais Adicionados ao Produto */}
                {productAdditionals.length > 0 && (
                  <div 
                    className="absolute"
                    style={{ 
                      top: '730px', 
                      left: '0px',
                      right: '0px'
                    }}
                  >
                    {productAdditionals.map((additionalId, index) => {
                      const additional = savedAdditionals.find(a => a.id === additionalId)
                      if (!additional) return null
                      
                      return (
                        <div 
                          key={additionalId}
                          className="border border-gray-300 flex items-center justify-between mb-4"
                          style={{ 
                            width: '100%', 
                            height: '98px',
                            borderRadius: '4px'
                          }}
                        >
                          <div className="flex items-center ml-6">
                            <div className="grid grid-cols-2 gap-1 mr-4 cursor-move">
                              {Array.from({ length: 10 }).map((_, index) => (
                                <div 
                                  key={index}
                                  className="w-1 h-1 bg-gray-400 rounded-full"
                                ></div>
                              ))}
                            </div>
                            
                            {/* Toggle Switch */}
                            <div className="flex items-center gap-2">
                              <button
                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none"
                                style={{ backgroundColor: additional.isActive ? '#542583' : '#d1d5db' }}
                                onClick={() => toggleSavedAdditionalState(additional.id)}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-in-out ${
                                    additional.isActive ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span 
                                className="font-medium text-gray-700" 
                                style={{ fontSize: '16px' }}
                              >
                                {additional.isActive ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            
                            {/* Foto do adicional */}
                            <div 
                              className="ml-8 mr-4 flex items-center justify-center overflow-hidden"
                              style={{ width: '80px', height: '80px', borderRadius: '0px' }}
                            >
                              <img 
                                src={additional.imageUrl}
                                alt={additional.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <span className="text-gray-700 font-medium" style={{ fontSize: '16px' }}>{additional.name}</span>
                          </div>
                          <div className="flex flex-col gap-8 mr-8">
                            {/* Ícone de Deletar */}
                            <button 
                              className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                              onClick={() => {
                                setProductAdditionals(prev => prev.filter(id => id !== additionalId))
                              }}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                height="24px" 
                                viewBox="0 -960 960 960" 
                                width="24px" 
                                fill="currentColor"
                              >
                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {/* Caixa de Foto no lado direito */}
                <div 
                  className="absolute overflow-hidden"
                  style={{ 
                    width: '210px', 
                    height: '210px',
                    top: '60px',
                    right: '0px',
                    borderRadius: '0px'
                  }}
                >
                  <img 
                    src={productImageUrl}
                    alt="Produto"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Caixa de upload/remover embaixo da foto */}
                {productImageUrl === '/product-placeholder.jpg' ? (
                  <label 
                    htmlFor="image-upload"
                    className="absolute bg-gray-200 border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors duration-200"
                    style={{ 
                      width: '210px', 
                      height: '40px',
                      top: '280px',
                      right: '0px',
                      borderRadius: '0px'
                    }}
                  >
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" 
                        />
                      </svg>
                      <span className="text-sm">Selecione uma foto</span>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <button 
                    onClick={() => setProductImageUrl('/product-placeholder.jpg')}
                    className="absolute bg-red-100 border border-red-300 flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors duration-200"
                    style={{ 
                      width: '210px', 
                      height: '40px',
                      top: '280px',
                      right: '0px',
                      borderRadius: '0px'
                    }}
                  >
                    <div className="flex items-center gap-2 text-red-600">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" 
                        fill="currentColor"
                      >
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                      </svg>
                      <span className="text-sm">Remover foto</span>
                    </div>
                  </button>
                )}
              </div>
            ) : showNewAdditionalArea || showEditAdditionalArea ? (
              /* Área totalmente vazia para novo adicional */
              <div 
                className="w-full relative" 
                style={{ 
                  minHeight: '100%',
                  height: `${contentHeight}px`
                }}
              >
                {/* Botão Voltar no canto superior esquerdo */}
                <button 
                  className="absolute top-0 left-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#542583' }}
                                     onClick={() => {
                     if (showEditAdditionalArea) {
                       resetAdditionalForm()
                       setEditingAdditionalId(null)
                       setShowEditAdditionalArea(false)
                     } else {
                       setShowNewAdditionalArea(false)
                     }
                   }}
                >
                  Voltar
                </button>
                
                {/* Botão Salvar no canto superior direito */}
                <button 
                  className="absolute top-0 right-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#542583' }}
                                     onClick={showEditAdditionalArea ? handleSaveEditAdditional : handleSaveAdditional}
                >
                  Salvar
                </button>
                
                {/* Título embaixo do botão */}
                <h2 
                  className="absolute text-gray-700 font-medium"
                  style={{ 
                    top: '60px', 
                    left: '0px',
                    fontSize: '16px'
                  }}
                                 >
                   {showEditAdditionalArea ? 'Editar adicional' : 'Informações do adicional'}
                 </h2>
                
                {/* Botões de Status */}
                <div 
                  className="absolute flex gap-3"
                  style={{ 
                    top: '100px', 
                    left: '0px'
                  }}
                >
                  {/* Ativo */}
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      isProductActive && categoryStatus === 'ativo'
                        ? 'shadow-sm'
                        : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: isProductActive && categoryStatus === 'ativo' ? '#f3e8ff' : 'transparent',
                      color: isProductActive && categoryStatus === 'ativo' ? '#542583' : undefined
                    }}
                    onClick={() => {
                      setIsProductActive(true)
                      setCategoryStatus('ativo')
                    }}
                  >
                    Ativo
                  </button>

                  {/* Inativo */}
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      !isProductActive && categoryStatus === 'inativo'
                        ? 'shadow-sm'
                        : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: !isProductActive && categoryStatus === 'inativo' ? '#f3e8ff' : 'transparent',
                      color: !isProductActive && categoryStatus === 'inativo' ? '#542583' : undefined
                    }}
                    onClick={() => {
                      setIsProductActive(false)
                      setCategoryStatus('inativo')
                    }}
                  >
                    Inativo
                  </button>

                  {/* Em falta */}
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      categoryStatus === 'em-falta'
                        ? 'shadow-sm'
                        : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: categoryStatus === 'em-falta' ? '#f3e8ff' : 'transparent',
                      color: categoryStatus === 'em-falta' ? '#542583' : undefined
                    }}
                    onClick={() => {
                      setIsProductActive(true)
                      setCategoryStatus('em-falta')
                    }}
                  >
                    Em falta
                  </button>
                </div>
                
                {/* Campo Nome do Adicional */}
                <div 
                  className="absolute"
                  style={{ 
                    top: '170px', 
                    left: '0px',
                    width: '100%',
                    maxWidth: '410px',
                    right: '0px'
                  }}
                >
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                    Nome do adicional
                  </label>
                  <input
                    type="text"
                    value={additionalName}
                    onChange={(e) => setAdditionalName(e.target.value)}
                    placeholder="Digite o nome do adicional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    style={{
                      height: '40px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                {/* Campo Descrição do Adicional */}
                <div 
                  className="absolute"
                  style={{ 
                    top: '250px', 
                    left: '0px',
                    width: '100%',
                    maxWidth: '410px',
                    right: '0px'
                  }}
                >
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                    Descrição do adicional
                  </label>
                  <textarea
                    value={additionalDescription}
                    onChange={(e) => setAdditionalDescription(e.target.value)}
                    placeholder="Digite a descrição do adicional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none [&::-webkit-scrollbar]:hidden"
                    style={{
                      minHeight: '80px',
                      fontSize: '16px',
                      lineHeight: '1.5',
                      overflow: 'hidden',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      const newHeight = Math.max(80, target.scrollHeight)
                      target.style.height = newHeight + 'px'
                      
                      // Calcular nova altura do conteúdo baseada na posição do textarea + sua altura + categoria + preço + quantidade + linha + botão + margem
                      const textareaTop = 250 // posição do textarea
                      const textareaHeight = newHeight
                      const categoryFieldHeight = 100 // categoria do adicional + label + espaçamento extra
                      const priceFieldHeight = 80 // preço do adicional + label + espaçamento
                      const quantityFieldHeight = 100 // caixas de quantidade + label + espaçamento extra
                      const dividerHeight = 30 // linha divisória + espaçamento
                      const additionalsButtonHeight = 60 // botão adicionar adicionais + espaçamento
                      const bottomMargin = 50 // margem inferior
                      const newContentHeight = Math.max(740, textareaTop + textareaHeight + categoryFieldHeight + priceFieldHeight + quantityFieldHeight + dividerHeight + additionalsButtonHeight + bottomMargin)
                      setContentHeight(newContentHeight)
                    }}
                  />
                </div>
                
                {/* Campo Categoria do Adicional */}
                <div 
                  className="absolute"
                  style={{ 
                    top: '380px', 
                    left: '0px',
                    width: '410px'
                  }}
                >
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                    Categoria do adicional
                  </label>
                  <div className="relative" ref={additionalCategoryDropdownRef}>
                    <button
                      className="w-full h-10 px-3 border border-gray-300 rounded bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onClick={() => setIsAdditionalCategoryDropdownOpen(!isAdditionalCategoryDropdownOpen)}
                    >
                      <span className="text-gray-900">{selectedAdditionalCategory}</span>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isAdditionalCategoryDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown menu */}
                    {isAdditionalCategoryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
                        {/* Categorias de adicionais dinâmicas */}
                        {additionalCategories.map((category) => (
                          <div 
                            key={category}
                            className="px-3 py-2 hover:bg-purple-50 cursor-pointer"
                            style={{ 
                              backgroundColor: selectedAdditionalCategory === category ? '#f3e8ff' : 'transparent',
                              color: selectedAdditionalCategory === category ? '#542583' : '#374151'
                            }}
                            onClick={() => {
                              setSelectedAdditionalCategory(category)
                              setIsAdditionalCategoryDropdownOpen(false)
                            }}
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Campo Preço do Adicional */}
                <div 
                  className="absolute"
                  style={{ 
                    top: '460px', 
                    left: '0px',
                    width: '200px'
                  }}
                >
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                    Preço
                  </label>
                  <input
                    type="text"
                    value={additionalPrice}
                    onChange={handleAdditionalPriceChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    style={{
                      height: '40px',
                      fontSize: '16px'
                    }}
                  />
                </div>


                
                {/* Caixa de Foto no lado direito */}
                <div 
                  className="absolute overflow-hidden"
                  style={{ 
                    width: '210px', 
                    height: '210px',
                    top: '60px',
                    right: '0px',
                    borderRadius: '0px'
                  }}
                >
                  <img 
                    src={additionalImageUrl}
                    alt="Adicional"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Caixa de upload/remover embaixo da foto */}
                {additionalImageUrl === '/product-placeholder.jpg' ? (
                  <label 
                    htmlFor="additional-image-upload"
                    className="absolute bg-gray-200 border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors duration-200"
                    style={{ 
                      width: '210px', 
                      height: '40px',
                      top: '280px',
                      right: '0px',
                      borderRadius: '0px'
                    }}
                  >
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" 
                        />
                      </svg>
                      <span className="text-sm">Selecione uma foto</span>
                    </div>
                    <input
                      id="additional-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <button 
                    onClick={() => setAdditionalImageUrl('/product-placeholder.jpg')}
                    className="absolute bg-red-100 border border-red-300 flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors duration-200"
                    style={{ 
                      width: '210px', 
                      height: '40px',
                      top: '280px',
                      right: '0px',
                      borderRadius: '0px'
                    }}
                  >
                    <div className="flex items-center gap-2 text-red-600">
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                      </svg>
                      <span className="text-sm">Remover foto</span>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              /* Conteúdo original */
              <>
            {/* Texto da categoria com contagem - Primeira linha */}
            <div className="mb-4">
              <span className="text-gray-700 font-medium" style={{ fontSize: '16px', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.3' }}>
                {activeFilterButton === 'Adicionais' && selectedAdditional 
                  ? `${selectedAdditional} (${getAdditionalCountByCategory(selectedAdditional)})`
                  : `${activeCategory} (${getProductCountByCategory(activeCategory)})`
                }
              </span>
            </div>

            {/* Barra de pesquisa e opções - Segunda linha */}
            <div className="flex items-center gap-4 mb-6">
              {/* Barra de pesquisa */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="text-gray-400">
                    <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar produtos"
                  className="pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#6b7280',
                    height: '40px',
                    borderRadius: '100px'
                  }}
                />
              </div>

              {/* Opções de lista */}
              <div className="flex gap-2">
                <button 
                  className={`px-4 py-2 border text-sm font-medium transition-colors ${
                    activeFilterButton === 'Produtos' 
                      ? 'bg-white text-purple-600 border-purple-600' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ 
                    height: '40px',
                    borderRadius: '100px'
                  }}
                  onClick={() => {
                    const newState = activeFilterButton === 'Produtos' ? '' : 'Produtos'
                    if (newState !== activeFilterButton) {
                      setIsLoadingImage(true)
                      setActiveFilterButton(newState)
                      setSelectedAdditional('') // Reset additional selection
                      setTimeout(() => {
                        setIsLoadingImage(false)
                      }, 1500)
                    }
                  }}
                >
                  Produtos
                </button>
                <button 
                  className={`px-4 py-2 border text-sm font-medium transition-colors ${
                    activeFilterButton === 'Adicionais' 
                      ? 'bg-white border-purple-600' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ 
                    height: '40px',
                    borderRadius: '100px',
                    color: activeFilterButton === 'Adicionais' ? '#542583' : undefined
                  }}
                  onClick={() => {
                    const newState = activeFilterButton === 'Adicionais' ? '' : 'Adicionais'
                    if (newState !== activeFilterButton) {
                      setIsLoadingImage(true)
                      setActiveFilterButton(newState)
                      // Se entrando no modo adicionais, seleciona a primeira categoria
                      if (newState === 'Adicionais') {
                        if (firebaseAdditionalCategories.length > 0) {
                          setSelectedAdditional(firebaseAdditionalCategories[0].name)
                        } else {
                          setSelectedAdditional('')
                        }
                      } else {
                        setSelectedAdditional('') // Reset additional selection
                      }
                      setTimeout(() => {
                        setIsLoadingImage(false)
                      }, 1500)
                    }
                  }}
                >
                  Adicionais
                </button>
                <button 
                  className={`px-4 py-2 border text-sm font-medium transition-colors ${
                    activeFilterButton === 'Promoções' 
                      ? 'bg-white text-purple-600 border-purple-600' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ 
                    height: '40px',
                    borderRadius: '100px'
                  }}
                  onClick={() => setActiveFilterButton(activeFilterButton === 'Promoções' ? '' : 'Promoções')}
                >
                  Promoções
                </button>
              </div>
            </div>

            {/* Botão Novo Produto/Adicional - Nova linha separada */}
            <div className="flex justify-end mb-6">
              {/* Verificar se há categorias antes de permitir criar */}
              {((activeFilterButton === 'Adicionais' && firebaseAdditionalCategories.length === 0) || 
                (activeFilterButton !== 'Adicionais' && firebaseCategories.length === 0)) ? (
                <div className="flex flex-col items-end">
                  <button 
                    className="bg-gray-400 text-white px-4 py-2 text-sm font-medium cursor-not-allowed flex items-center gap-2"
                    style={{ 
                      height: '40px',
                      borderRadius: '100px'
                    }}
                    disabled
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                      <path d="M440-120v-320H120v-80h320v-320h80v320h320v80H520v320h-80Z"/>
                    </svg> 
                    {activeFilterButton === 'Adicionais' ? 'Novo adicional' : 'Novo produto'}
                  </button>
                  <span className="text-sm text-gray-500 mt-1">
                    {activeFilterButton === 'Adicionais' 
                      ? 'Crie uma categoria de adicional primeiro' 
                      : 'Crie uma categoria primeiro'
                    }
                  </span>
                </div>
              ) : (
              <button 
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                style={{ 
                  backgroundColor: '#542583', 
                  height: '40px',
                  borderRadius: '100px'
                }}
                onClick={() => {
                  if (activeFilterButton === 'Adicionais') {
                    resetAdditionalForm()
                    setShowNewAdditionalArea(true)
                  } else {
                    resetProductForm()
                    setShowNewProductArea(true)
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                  <path d="M440-120v-320H120v-80h320v-320h80v320h320v80H520v320h-80Z"/>
                </svg> 
                {activeFilterButton === 'Adicionais' ? 'Novo adicional' : 'Novo produto'}
              </button>
              )}
            </div>

            {/* Lista de produtos/adicionais salvos */}
            {activeFilterButton === 'Adicionais' ? (
              // Renderizar adicionais salvos filtrados por categoria
              savedAdditionals
                .filter(additional => 
                  selectedAdditional === '' || 
                  additional.category === selectedAdditional
                )
                .map((additional) => (
                <div 
                  key={additional.id}
                  className="border border-gray-300 flex items-center justify-between mb-4"
                  style={{ 
                    width: '100%', 
                    height: '98px',
                    borderRadius: '4px'
                  }}
                >
                  <div className="flex items-center ml-6">
                    <div className="grid grid-cols-2 gap-1 mr-4 cursor-move">
                      {Array.from({ length: 10 }).map((_, index) => (
                        <div 
                          key={index}
                          className="w-1 h-1 bg-gray-400 rounded-full"
                        ></div>
                      ))}
                    </div>
                    
                    {/* Toggle Switch */}
                    <div className="flex items-center gap-2">
                      <button
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none"
                        style={{ backgroundColor: additional.isActive ? '#542583' : '#d1d5db' }}
                        onClick={() => toggleSavedAdditionalState(additional.id)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-in-out ${
                            additional.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span 
                        className="font-medium text-gray-700" 
                        style={{ fontSize: '16px' }}
                      >
                        {additional.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    {/* Foto do adicional */}
                    <div 
                      className="ml-8 mr-4 flex items-center justify-center overflow-hidden"
                      style={{ width: '80px', height: '80px', borderRadius: '0px' }}
                    >
                      <img 
                        src={additional.imageUrl}
                        alt={additional.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <span className="text-gray-700 font-medium" style={{ fontSize: '16px' }}>{additional.name}</span>
                  </div>
                  <div className="flex flex-col gap-8 mr-8">
                    {/* Ícone de Editar */}
                    <button 
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => openEditAdditional(additional.id)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" 
                        fill="currentColor"
                      >
                        <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
                      </svg>
                    </button>
                    
                    {/* Ícone de Deletar */}
                                                <button 
                              className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                              onClick={() => handleDeleteAdditional(additional.id)}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                height="24px" 
                                viewBox="0 -960 960 960" 
                                width="24px" 
                                fill="currentColor"
                              >
                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                              </svg>
                            </button>
                  </div>
                </div>
              ))
            ) : (
              // Renderizar produtos salvos filtrados por categoria
              savedProducts
                .filter(product => 
                  activeCategory === '' || 
                  product.category === activeCategory
                )
                .map((product) => (
                <div 
                  key={product.id}
                  className="border border-gray-300 flex items-center justify-between mb-4"
                  style={{ 
                    width: '100%', 
                    height: '98px',
                    borderRadius: '4px'
                  }}
                >
                  <div className="flex items-center ml-6">
                    <div className="grid grid-cols-2 gap-1 mr-4 cursor-move">
                      {Array.from({ length: 10 }).map((_, index) => (
                        <div 
                          key={index}
                          className="w-1 h-1 bg-gray-400 rounded-full"
                        ></div>
                      ))}
                    </div>
                    
                    {/* Toggle Switch */}
                    <div className="flex items-center gap-2">
                      <button
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none"
                        style={{ backgroundColor: product.isActive ? '#542583' : '#d1d5db' }}
                        onClick={() => toggleSavedProductState(product.id)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-in-out ${
                            product.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span 
                        className="font-medium text-gray-700" 
                        style={{ fontSize: '16px' }}
                      >
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    {/* Foto do produto */}
                    <div 
                      className="ml-8 mr-4 flex items-center justify-center overflow-hidden"
                      style={{ width: '80px', height: '80px', borderRadius: '0px' }}
                    >
                      <img 
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <span className="text-gray-700 font-medium" style={{ fontSize: '16px' }}>{product.name}</span>
                  </div>
                  <div className="flex flex-col gap-8 mr-8">
                    {/* Ícone de Editar */}
                    <button 
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => openEditProduct(product.id)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" 
                        fill="currentColor"
                      >
                        <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
                      </svg>
                    </button>
                    
                    {/* Ícone de Deletar */}
                    <button 
                      className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" 
                        fill="currentColor"
                      >
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                              ))
            )}

            {/* Mensagem quando não há produtos */}
            {activeFilterButton === 'Adicionais' ? (
              savedAdditionals.filter(additional => 
                selectedAdditional === '' || 
                additional.category === selectedAdditional
              ).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg 
                    className="w-16 h-16 mb-4 text-gray-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                    />
                  </svg>
                  <p className="text-lg font-medium mb-2">Nenhum adicional encontrado</p>
                  <p className="text-sm">
                    Crie seu primeiro adicional clicando em "Novo adicional"
                  </p>
                </div>
              )
            ) : (
              savedProducts.filter(product => 
                activeCategory === '' || 
                product.category === activeCategory
              ).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg 
                    className="w-16 h-16 mb-4 text-gray-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                    />
                  </svg>
                  <p className="text-lg font-medium mb-2">Nenhum produto encontrado</p>
                  <p className="text-sm">
                    {activeCategory === ''
                      ? 'Crie seu primeiro produto clicando em "Novo produto"'
                      : `Não há produtos na categoria "${activeCategory}"`
                    }
                  </p>
                </div>
              )
            )}
            </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <>
          {/* Overlay animado */}
          <div
            className="fixed inset-0"
            style={{
              backgroundColor: isModalAnimating ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
              transition: 'all 0.3s ease-out',
              zIndex: 70
            }}
            onClick={closeModal}
          ></div>
          {/* Modal animado */}
          <div
            className={`bg-white fixed top-1/2 left-1/2 w-full max-w-md mx-auto`}
            style={{
              minHeight: activeFilterButton === 'Adicionais' && (categorySelectionType === 'multipla' || categorySelectionType === 'somavel') ? '650px' : activeFilterButton === 'Adicionais' ? '550px' : '450px',
              maxHeight: '90vh',
              borderRadius: '4px',
              transform: isModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
              opacity: isModalAnimating ? 1 : 0,
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              zIndex: 71,
              overflow: 'hidden'
            }}
          >
            {/* Botão X e conteúdo do modal */}
            <button
              className="absolute text-gray-400 hover:text-gray-600 transition-colors"
              onClick={closeModal}
              style={{ 
                fontSize: '32px', 
                lineHeight: '1',
                top: '8px',
                right: '16px'
              }}
            >
              ×
            </button>
            
            {/* Conteúdo do modal */}
            <div className="p-6 h-full flex flex-col">
              {/* Área do conteúdo principal */}
              <div className="flex-1">
                {/* Título */}
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {isEditingCategory ? 'Editar categoria' : 'Crie uma nova categoria'}
                </h2>
                
                {/* Template selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Esse adicional vai ser:
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="w-full h-10 px-3 border border-gray-300 rounded bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="text-gray-900">{selectedTemplate}</span>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown menu */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
                        <div 
                          className="px-3 py-2 hover:bg-purple-50 cursor-pointer"
                          style={{ 
                            backgroundColor: selectedTemplate === 'Opcional' ? '#f3e8ff' : 'transparent',
                            color: selectedTemplate === 'Opcional' ? '#542583' : '#374151'
                          }}
                          onClick={() => {
                            setSelectedTemplate('Opcional')
                            setIsDropdownOpen(false)
                          }}
                        >
                          Opcional
                        </div>
                        <div 
                          className="px-3 py-2 hover:bg-purple-50 cursor-pointer"
                          style={{ 
                            backgroundColor: selectedTemplate === 'Obrigatório' ? '#f3e8ff' : 'transparent',
                            color: selectedTemplate === 'Obrigatório' ? '#542583' : '#374151'
                          }}
                          onClick={() => {
                            setSelectedTemplate('Obrigatório')
                            setIsDropdownOpen(false)
                          }}
                        >
                          Obrigatório
                        </div>
                      </div>
                    )}
                  </div>

                </div>
                
                {/* Category name input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da categoria
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => {
                      setCategoryName(e.target.value)
                      if (nameError) setNameError('') // Limpar erro ao digitar
                    }}
                    className={`w-full h-10 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      nameError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder=""
                  />
                  {nameError && (
                    <p className="text-red-500 text-sm mt-1">{nameError}</p>
                  )}
                </div>

                {/* Category description input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da categoria
                  </label>
                  <textarea
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Digite uma descrição para a categoria (opcional)"
                  />
                </div>

                {/* Selection type - apenas para categorias de adicionais */}
                {activeFilterButton === 'Adicionais' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de seleção
                    </label>
                    <div className="flex gap-3">
                      {/* Opção Única */}
                      <button
                        className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                          categorySelectionType === 'unica'
                            ? 'border-purple-600 shadow-sm'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{
                          backgroundColor: categorySelectionType === 'unica' ? '#f3e8ff' : 'transparent',
                          color: categorySelectionType === 'unica' ? '#542583' : '#374151'
                        }}
                        onClick={() => setCategorySelectionType('unica')}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center flex-shrink-0">
                            {categorySelectionType === 'unica' && <div className="w-3 h-3 rounded-full bg-current"></div>}
                          </div>
                          Opção única
                        </div>
                      </button>

                      {/* Múltipla */}
                      <button
                        className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                          categorySelectionType === 'multipla'
                            ? 'border-purple-600 shadow-sm'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{
                          backgroundColor: categorySelectionType === 'multipla' ? '#f3e8ff' : 'transparent',
                          color: categorySelectionType === 'multipla' ? '#542583' : '#374151'
                        }}
                        onClick={() => setCategorySelectionType('multipla')}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center flex-shrink-0">
                            {categorySelectionType === 'multipla' && <div className="w-3 h-3 rounded-full bg-current"></div>}
                          </div>
                          Múltipla
                        </div>
                      </button>

                      {/* Somável */}
                      <button
                        className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                          categorySelectionType === 'somavel'
                            ? 'border-purple-600 shadow-sm'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{
                          backgroundColor: categorySelectionType === 'somavel' ? '#f3e8ff' : 'transparent',
                          color: categorySelectionType === 'somavel' ? '#542583' : '#374151'
                        }}
                        onClick={() => setCategorySelectionType('somavel')}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center flex-shrink-0">
                            {categorySelectionType === 'somavel' && <div className="w-3 h-3 rounded-full bg-current"></div>}
                          </div>
                          Somável
                        </div>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {categorySelectionType === 'unica' && 'Cliente pode escolher apenas uma opção (radio button)'}
                      {categorySelectionType === 'multipla' && 'Cliente pode escolher várias opções (checkbox)'}
                      {categorySelectionType === 'somavel' && 'Cliente pode definir quantidade de cada opção (+/-)'}
                    </p>
                  </div>
                )}

                {/* Campos de quantidade - apenas para múltipla e somável */}
                {activeFilterButton === 'Adicionais' && (categorySelectionType === 'multipla' || categorySelectionType === 'somavel') && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Quantidade para escolha
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600">O cliente escolherá de</span>
                      
                      <input
                        type="number"
                        value={minQuantity}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '' || (parseInt(value) >= 0 && parseInt(value) < parseInt(maxQuantity))) {
                            setMinQuantity(value)
                          }
                        }}
                        className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                        min="0"
                        placeholder="0"
                      />
                      
                      <span className="text-gray-700" style={{ fontSize: '12px' }}>até</span>
                      
                      <input
                        type="number"
                        value={maxQuantity}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '' || (parseInt(value) > 0 && parseInt(value) > parseInt(minQuantity))) {
                            setMaxQuantity(value)
                          }
                        }}
                        className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                        min="1"
                        placeholder="3"
                      />
                      
                      <span className="text-gray-700" style={{ fontSize: '12px' }}>unidades</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Área dos botões */}
              <div className="flex justify-end">
                <button 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#542583' }}
                  onClick={handleSaveCategory}
                >
                  {isEditingCategory ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}



      {/* Modal de Crop de Imagem */}
      {showCropModal && (
        <>
          <div
            className="fixed inset-0"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              transition: 'all 0.3s ease-out',
              zIndex: 70
            }}
            onClick={handleCropCancel}
          ></div>
          <div
            className="bg-white fixed top-1/2 left-1/2 w-full max-w-2xl mx-auto rounded-lg p-6"
            style={{
              minHeight: '500px',
              maxHeight: '90vh',
              transform: showCropModal ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
              opacity: showCropModal ? 1 : 0,
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              zIndex: 71,
              overflow: 'hidden'
            }}
          >
            {/* Header do modal */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recortar Imagem</h3>
              <button
                onClick={handleCropCancel}
                className="text-gray-400 hover:text-gray-600"
                style={{ fontSize: '24px' }}
              >
                ×
              </button>
            </div>

            {/* Área de preview da imagem */}
            <div className="flex flex-col items-center mb-6">
              <div 
                className="flex items-center justify-center mb-4 select-none"
                style={{ 
                  position: 'relative',
                  display: 'inline-block'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img 
                  id="crop-image"
                  src={imageToCrop}
                  alt="Imagem para recortar"
                  className="block pointer-events-none"
                  style={{ maxWidth: '400px', maxHeight: '400px' }}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement
                    setImageDimensions({ 
                      width: img.offsetWidth, 
                      height: img.offsetHeight 
                    })
                    // Centralizar o crop na imagem com tamanho padrão
                    setCropSize({ width: 210, height: 210 })
                    setCropPosition({ 
                      x: Math.max(0, (img.offsetWidth - 210) / 2), 
                      y: Math.max(0, (img.offsetHeight - 210) / 2) 
                    })
                  }}
                />
                
                {/* Overlay escuro nas áreas fora do recorte */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Área superior */}
                  <div 
                    className="absolute bg-black bg-opacity-60"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      height: `${cropPosition.y}px`
                    }}
                  />
                  {/* Área inferior */}
                  <div 
                    className="absolute bg-black bg-opacity-60"
                    style={{
                      top: `${cropPosition.y + cropSize.height}px`,
                      left: 0,
                      right: 0,
                      bottom: 0
                    }}
                  />
                  {/* Área esquerda */}
                  <div 
                    className="absolute bg-black bg-opacity-60"
                    style={{
                      top: `${cropPosition.y}px`,
                      left: 0,
                      width: `${cropPosition.x}px`,
                      height: `${cropSize.height}px`
                    }}
                  />
                  {/* Área direita */}
                  <div 
                    className="absolute bg-black bg-opacity-60"
                    style={{
                      top: `${cropPosition.y}px`,
                      left: `${cropPosition.x + cropSize.width}px`,
                      right: 0,
                      height: `${cropSize.height}px`
                    }}
                  />
                </div>

                {/* Quadrado de crop móvel */}
                <div 
                  className="absolute border-2 border-purple-500 bg-purple-500 bg-opacity-10 cursor-move"
                  style={{ 
                    width: `${cropSize.width}px`, 
                    height: `${cropSize.height}px`,
                    left: `${cropPosition.x}px`,
                    top: `${cropPosition.y}px`,
                    userSelect: 'none'
                  }}
                  onMouseDown={handleMouseDown}
                >
                  {/* Linhas de grade */}
                  <div className="w-full h-full relative">
                    {/* Linha vertical 1/3 */}
                    <div 
                      className="absolute bg-white bg-opacity-50"
                      style={{ 
                        left: '33.33%', 
                        top: '0', 
                        width: '1px', 
                        height: '100%' 
                      }}
                    />
                    {/* Linha vertical 2/3 */}
                    <div 
                      className="absolute bg-white bg-opacity-50"
                      style={{ 
                        left: '66.66%', 
                        top: '0', 
                        width: '1px', 
                        height: '100%' 
                      }}
                    />
                    {/* Linha horizontal 1/3 */}
                    <div 
                      className="absolute bg-white bg-opacity-50"
                      style={{ 
                        top: '33.33%', 
                        left: '0', 
                        height: '1px', 
                        width: '100%' 
                      }}
                    />
                    {/* Linha horizontal 2/3 */}
                    <div 
                      className="absolute bg-white bg-opacity-50"
                      style={{ 
                        top: '66.66%', 
                        left: '0', 
                        height: '1px', 
                        width: '100%' 
                      }}
                    />
                  </div>
                  
                  {/* Controles de redimensionamento nos cantos */}
                  <div 
                    className="absolute -top-1 -left-1 w-3 h-3 bg-purple-500 border border-white cursor-nw-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'topleft')}
                  ></div>
                  <div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 border border-white cursor-ne-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'topright')}
                  ></div>
                  <div 
                    className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 border border-white cursor-sw-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'bottomleft')}
                  ></div>
                  <div 
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 border border-white cursor-se-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'bottomright')}
                  ></div>
                  


                </div>
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                Arraste o quadrado roxo para posicionar o recorte da imagem
              </p>
            </div>

            {/* Botões do modal */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCropCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCropConfirm}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors"
                style={{ backgroundColor: '#542583' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Adicionar Adicionais */}
      {showAddAdditionalsModal && (
        <>
          <div
            className="fixed inset-0"
            style={{
              backgroundColor: isClosingAddAdditionalsModal ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.5)',
              transition: 'all 0.3s ease-out',
              zIndex: 70
            }}
            onClick={closeAddAdditionalsModal}
          ></div>
          {showAddAdditionalsModalContent && (
            <div
              className="bg-white fixed top-1/2 left-1/2 w-full max-w-2xl mx-auto"
              style={{
                minHeight: '500px',
                maxHeight: '90vh',
                borderRadius: '4px',
                transform: showAddAdditionalsModalContent && !isClosingAddAdditionalsModal ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
                opacity: showAddAdditionalsModalContent && !isClosingAddAdditionalsModal ? 1 : 0,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: 71,
                overflow: 'hidden'
              }}
            >
              {/* Botão X para fechar */}
              <button
                className="absolute text-gray-400 hover:text-gray-600 transition-colors"
                onClick={closeAddAdditionalsModal}
                style={{ 
                  fontSize: '32px', 
                  lineHeight: '1',
                  top: '8px',
                  right: '16px'
                }}
              >
                ×
              </button>
              
              {/* Conteúdo do modal */}
              <div className="h-full flex flex-col">
                {/* Header fixo */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Adicionar Adicionais</h2>
                </div>
                
                {/* Conteúdo scrollável */}
                <div className="flex-1 overflow-hidden px-6 py-4">
                  {/* Barra de pesquisa */}
                  {savedAdditionals.length > 0 && (
                    <div className="relative mb-4">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="text-gray-400">
                          <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar adicionais..."
                        className="pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
                        style={{
                          backgroundColor: '#f5f5f5',
                          borderRadius: '100px'
                        }}
                        // TODO: Adicionar funcionalidade de busca
                      />
                    </div>
                  )}
                  
                  {/* Lista de adicionais */}
                  {savedAdditionals.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">Nenhum adicional encontrado</p>
                      <p className="text-sm text-gray-500">Crie seu primeiro adicional para poder adicioná-lo aqui</p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto h-full">
                      {savedAdditionals.map((additional) => (
                        <div 
                          key={additional.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-md mb-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {/* Foto do adicional */}
                            <div className="w-12 h-12 overflow-hidden flex-shrink-0" style={{ borderRadius: '0px' }}>
                              <img 
                                src={additional.imageUrl}
                                alt={additional.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Informações do adicional */}
                <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{additional.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{additional.category}</span>
                                <span>{additional.price}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Lado direito: Tipo de seleção + Checkbox */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Tipo de seleção */}
                            <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {(() => {
                                const categoryData = firebaseAdditionalCategories.find(cat => cat.name === additional.category)
                                const selectionType = categoryData?.selectionType || 'unica'
                                
                                switch (selectionType) {
                                  case 'unica':
                                    return 'Escolha única'
                                  case 'multipla':
                                    return 'Múltipla'
                                  case 'somavel':
                                    return 'Somável'
                                  default:
                                    return 'Escolha única'
                                }
                              })()}
                            </span>
                            
                            {/* Checkbox para seleção */}
                            <input
                              type="checkbox"
                              className="w-6 h-6 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              checked={selectedAdditionalIds.includes(additional.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAdditionalIds(prev => [...prev, additional.id])
                                } else {
                                  setSelectedAdditionalIds(prev => prev.filter(id => id !== additional.id))
                                }
                              }}
                            />
                  </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Footer fixo com botões */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-end gap-3">
                  <button 
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={closeAddAdditionalsModal}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="px-6 py-2 rounded-md text-sm font-medium transition-colors bg-purple-600 hover:bg-purple-700 text-white"
                    style={{ backgroundColor: '#542583' }}
                    onClick={() => {
                      // Salvar a seleção atual (pode ser vazia para remover todos)
                      setProductAdditionals(selectedAdditionalIds)
                      closeAddAdditionalsModal()
                    }}
                  >
                    {selectedAdditionalIds.length > 0 
                      ? `Salvar (${selectedAdditionalIds.length})` 
                      : 'Salvar'
                    }
                  </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
    </ProtectedRoute>
  )
} 
