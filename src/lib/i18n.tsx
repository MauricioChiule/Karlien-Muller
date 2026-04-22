import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ptBR as ptMZ, enUS, es, fr } from 'date-fns/locale';
import { Locale } from 'date-fns';

type Language = 'pt' | 'en' | 'es' | 'fr';

const translations = {
  pt: {
    landing: {
      welcome: "Bem-vindo!",
      incorrect_password: "Senha incorreta.",
      access: "Acesso",
      team_password: "Senha da Equipa",
      enter: "Entrar",
      slogan: "A sua beleza, <br/>a nossa assinatura.",
      slogan_desc: "Um espaço dedicado a realçar o que há de melhor em si, com profissionais de excelência e produtos premium.",
      how_to_access: "Como deseja aceder à plataforma hoje?",
      i_am_client: "Sou Cliente",
      client_desc: "Quero agendar um horário para o meu cabelo ou tratamento.",
      i_am_team: "Sou da Equipa",
      team_desc: "Acesso ao painel de gestão do salão e agenda.",
      location: "Maputo, Moçambique"
    },
    nav: {
      dashboard: "Painel",
      calendar: "Agenda",
      book: "Agendar",
      new_reservation: "Nova Reserva",
      professionals: "Profissionais",
      services: "Serviços",
      management: "Gestão",
      customers: "Clientes",
      exit: "Sair",
      back: "Voltar",
      home: "Início",
      team: "Equipa"
    },
    booking: {
      fill_data: "Preencha os seus dados por favor.",
      invalid_phone: "Número de telefone inválido. Insira um número de Moçambique (ex: 84... ou +258...).",
      confirming: "A confirmar agendamento...",
      success_toast: "Agendamento realizado com sucesso!",
      error_toast: "Erro ao salvar o agendamento. Tente novamente.",
      success_title: "Agendamento Realizado!",
      success_desc: "Olá <strong class='text-tulip-900'>{name}</strong>, o seu momento para <strong>{service}</strong> com <strong>{professional}</strong> está reservado para o dia <strong>{date}</strong> às <strong>{time}</strong>.",
      success_note: "Guarde o seu número de telemóvel para consultar o estado. Poderá acompanhar tudo na aba <strong>Meus Agendamentos</strong>.",
      view_appointments: "Ver Meus Agendamentos",
      new_booking: "Fazer Nova Marcação",
      step: "Passo {current} de {total}",
      step1_title: "Escolha o Serviço",
      step2_title: "Escolha o Profissional",
      step3_title: "Qual é a Data?",
      step4_title: "Escolha a Hora",
      step5_title: "Os Seus Dados",
      price: "Preço",
      duration: "Duração",
      next: "Seguinte",
      no_professionals: "Nenhum profissional disponível para este serviço.",
      select_time: "Selecione o horário",
      no_slots: "Não há vagas disponíveis neste dia. Por favor, escolha outra data.",
      your_name: "O seu nome e apelido",
      your_phone: "Número de Telemóvel (M-Pesa/Emola)",
      confirm_booking: "Confirmar Agendamento",
      expert_available: "Especialista disponível",
      day_off: "Folga",
      time_on: "Horários em",
      at: "às",
      with: "com",
      choose_another_date: "Escolher outra data",
      status_pending: "Pendente"
    },
    dashboard: {
      overview: "Faça a gestão de todas as reservas do salão.",
      clients_today: "Clientes Hoje",
      pending_today: "Hoje Pendentes",
      total_appointments: "Total de Marcações",
      search: "Pesquisar cliente ou telemóvel...",
      status_all: "Status (Todos)",
      no_results: "Nenhum agendamento encontrado.",
      confirm: "Confirmado",
      cancel: "Cancelado",
      reactivate: "Reativar",
      delete: "Eliminar",
      client: "Cliente",
      contact: "Contacto",
      service: "Serviço",
      professional: "Profissional",
      date_time: "Data e Hora",
      status: "Status",
      action: "Ação",
      created_at: "Criado em"
    },
    client_appointments: {
      title: "Consulta Privada",
      subtitle: "Acompanhe o estado das suas marcações feitas neste dispositivo.",
      subtitle_search: "Pesquise pelo seu nome para confirmar o seu agendamento.",
      private_subtitle: "Insira o seu nome exato para visualizar as suas marcações confidenciais.",
      placeholder: "Seu nome (Ex: Joana Silva)",
      search_placeholder_exact: "O seu nome completo (Ex: Joana Silva)",
      search: "Consultar",
      no_results: "Ainda não tens agendamentos.",
      no_results_found: "Nenhum agendamento encontrado.",
      results_found: "agendamento(s) encontrado(s)",
      min_chars: "Escreva pelo menos 3 caracteres.",
      welcome_search: "Consulta Segura",
      check_exact_name: "Certifique-se de que escreveu o seu nome exatamente como no momento da reserva.",
      check_name: "Verifique se o nome está escrito exatamente como no momento do agendamento.",
      appointment: "Agendamento",
      ref: "Ref"
    },
    calendar: {
      this_week: "Esta Semana",
      whole_team: "Equipa Completa",
      today_schedule: "Horários de Hoje",
      appointments: "agendamentos",
      free_slot: "Horário Livre"
    },
    management_services: {
      subtitle: "Faça a gestão dos serviços oferecidos no salão.",
      add_service: "Adicionar Serviço",
      service_removed: "Serviço removido com sucesso.",
      new_service: "Novo Serviço",
      edit_service: "Editar Serviço",
      service_name: "Nome do Serviço",
      price: "Preço",
      duration_min: "Duração (min)",
      category: "Categoria (opcional)",
      save_changes: "Salvar Alterações",
      create_service: "Criar Serviço",
      confirm_delete: "Confirmar Exclusão",
      confirm_delete_desc: "Tem certeza que deseja eliminar este serviço? Esta ação não pode ser desfeita.",
      service_added: "Serviço adicionado!",
      service_updated: "Serviço atualizado!",
      no_services: "Nenhum serviço encontrado."
    },
    management_professionals: {
      subtitle: "Gerencie os profissionais e as suas especialidades.",
      add_professional: "Adicionar Profissional",
      prof_removed: "Profissional removido com sucesso.",
      new_prof: "Novo Profissional",
      edit_prof: "Editar Profissional",
      prof_name: "Nome Completo",
      prof_photo: "Foto do Profissional",
      prof_email: "Email",
      prof_phone: "Telemóvel",
      role: "Cargo (ex: Estilista, Manicure)",
      specialties: "Especialidades (Serviços)",
      select_services: "Selecione os serviços",
      no_services_yet: "Adicione serviços primeiro.",
      schedule: "Horário de Trabalho",
      start_time: "Início (HH:mm)",
      end_time: "Fim (HH:mm)",
      working_days: "Dias de Trabalho",
      mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat: "Sáb", sun: "Dom",
      create_prof: "Criar Profissional",
      confirm_delete: "Confirmar Exclusão",
      confirm_delete_desc: "Tem certeza que deseja eliminar este profissional? Esta ação não pode ser desfeita.",
      prof_added: "Profissional adicionado!",
      prof_updated: "Profissional atualizado!",
      no_professionals: "Nenhum profissional encontrado."
    },
    management_customers: {
      subtitle: "Faça a gestão dos perfis e histórico dos seus clientes.",
      add_customer: "Adicionar Cliente",
      customer_removed: "Perfil do cliente removido.",
      new_customer: "Novo Cliente",
      edit_customer: "Editar Cliente",
      customer_name: "Nome Completo",
      customer_phone: "Telemóvel",
      customer_notes: "Notas e Preferências",
      history: "Histórico de Agendamentos",
      no_history: "Nenhum agendamento anterior registrado.",
      save_changes: "Salvar Alterações",
      create_customer: "Criar Perfil",
      confirm_delete: "Confirmar Exclusão",
      confirm_delete_desc: "Tem certeza que deseja eliminar este perfil de cliente? Esta ação não pode ser desfeita.",
      customer_added: "Cliente adicionado!",
      customer_updated: "Cliente atualizado!",
      no_customers: "Nenhum cliente encontrado.",
      search_placeholder: "Pesquisar por nome ou telefone..."
    },
    common: {
      loading: "A carregar...",
      error_title: "Ops! Algo deu errado",
      error_desc: "Pedimos desculpa, mas a aplicação encontrou um problema ao carregar.",
      reload: "Recarregar a página"
    },
    languages: {
      pt: "Português",
      en: "Inglês",
      es: "Espanhol",
      fr: "Francês"
    }
  },
  en: {
    landing: {
      welcome: "Welcome!",
      incorrect_password: "Incorrect password.",
      access: "Access",
      team_password: "Staff Password",
      enter: "Enter",
      slogan: "Your beauty, <br/>our signature.",
      slogan_desc: "A dedicated space to enhance the best in you, with top professionals and premium products.",
      how_to_access: "How do you want to access the platform today?",
      i_am_client: "I am a Client",
      client_desc: "I want to schedule an appointment for my hair or treatment.",
      i_am_team: "Staff Member",
      team_desc: "Access the salon management dashboard and calendar.",
      location: "Maputo, Mozambique"
    },
    nav: {
      dashboard: "Dashboard",
      calendar: "Calendar",
      book: "Book",
      new_reservation: "New Booking",
      professionals: "Professionals",
      services: "Services",
      management: "Management",
      customers: "Customers",
      exit: "Sign Out",
      back: "Back",
      home: "Home",
      team: "Team"
    },
    booking: {
      fill_data: "Please fill in your details.",
      invalid_phone: "Invalid phone number. Please enter a valid number.",
      confirming: "Confirming booking...",
      success_toast: "Booking successfully completed!",
      error_toast: "Error saving booking. Please try again.",
      success_title: "Booking Confirmed!",
      success_desc: "Hi <strong class='text-tulip-900'>{name}</strong>, your time for <strong>{service}</strong> with <strong>{professional}</strong> is reserved for <strong>{date}</strong> at <strong>{time}</strong>.",
      success_note: "Keep your mobile number to check the status. You can track everything in the <strong>My Appointments</strong> tab.",
      view_appointments: "View My Appointments",
      new_booking: "Make New Booking",
      step: "Step {current} of {total}",
      step1_title: "Choose Service",
      step2_title: "Choose Professional",
      step3_title: "What's the Date?",
      step4_title: "Choose Time",
      step5_title: "Your Details",
      price: "Price",
      duration: "Duration",
      next: "Next",
      no_professionals: "No professionals available for this service.",
      select_time: "Select time",
      no_slots: "No slots available on this day. Please choose another date.",
      your_name: "Your full name",
      your_phone: "Mobile Number",
      confirm_booking: "Confirm Booking",
      expert_available: "Expert available",
      day_off: "Day off",
      time_on: "Times on",
      at: "at",
      with: "with",
      choose_another_date: "Choose another date",
      status_pending: "Pending"
    },
    dashboard: {
      overview: "Manage all salon bookings securely.",
      clients_today: "Clients Today",
      pending_today: "Pending Today",
      total_appointments: "Total Bookings",
      search: "Search client or phone...",
      status_all: "Status (All)",
      no_results: "No bookings found.",
      confirm: "Confirm",
      cancel: "Cancel",
      reactivate: "Reactivate",
      delete: "Delete",
      client: "Client",
      contact: "Contact",
      service: "Service",
      professional: "Professional",
      date_time: "Date & Time",
      status: "Status",
      action: "Action",
      created_at: "Created at"
    },
    client_appointments: {
      title: "Private Consultation",
      subtitle: "Track the status of your bookings made on this device.",
      subtitle_search: "Search for your name to confirm your appointment.",
      private_subtitle: "Enter your exact name to view your confidential bookings.",
      placeholder: "Your name (E.g.: Jane Doe)",
      search_placeholder_exact: "Your full name (E.g.: Jane Doe)",
      search: "Consult",
      no_results: "You have no appointments yet.",
      no_results_found: "No appointments found.",
      results_found: "appointment(s) found",
      min_chars: "Write at least 3 characters.",
      welcome_search: "Secure Search",
      check_exact_name: "Make sure you wrote your name exactly as you did during booking.",
      check_name: "Make sure the name is written exactly as it was when booking.",
      appointment: "Appointment",
      ref: "Ref"
    },
    calendar: {
      this_week: "This Week",
      whole_team: "Whole Team",
      today_schedule: "Today's Schedule",
      appointments: "appointments",
      free_slot: "Free Slot"
    },
    management_services: {
      subtitle: "Manage the services offered in the salon.",
      add_service: "Add Service",
      service_removed: "Service successfully removed.",
      new_service: "New Service",
      edit_service: "Edit Service",
      service_name: "Service Name",
      price: "Price",
      duration_min: "Duration (min)",
      category: "Category (optional)",
      save_changes: "Save Changes",
      create_service: "Create Service",
      confirm_delete: "Confirm Deletion",
      confirm_delete_desc: "Are you sure you want to delete this service? This action cannot be undone.",
      service_added: "Service added!",
      service_updated: "Service updated!",
      no_services: "No services found."
    },
    management_professionals: {
      subtitle: "Manage professionals and their specialties.",
      add_professional: "Add Professional",
      prof_removed: "Professional successfully removed.",
      new_prof: "New Professional",
      edit_prof: "Edit Professional",
      prof_name: "Full Name",
      prof_photo: "Professional Picture",
      prof_email: "Email",
      prof_phone: "Mobile",
      role: "Role (e.g. Stylist, Manicourist)",
      specialties: "Specialties (Services)",
      select_services: "Select services",
      no_services_yet: "Add services first.",
      schedule: "Work Schedule",
      start_time: "Start (HH:mm)",
      end_time: "End (HH:mm)",
      working_days: "Working Days",
      mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
      create_prof: "Create Professional",
      confirm_delete: "Confirm Deletion",
      confirm_delete_desc: "Are you sure you want to delete this professional? This action cannot be undone.",
      prof_added: "Professional added!",
      prof_updated: "Professional updated!",
      no_professionals: "No professionals found."
    },
    management_customers: {
      subtitle: "Manage client profiles and history.",
      add_customer: "Add Customer",
      customer_removed: "Customer profile removed.",
      new_customer: "New Customer",
      edit_customer: "Edit Customer",
      customer_name: "Full Name",
      customer_phone: "Mobile",
      customer_notes: "Notes & Preferences",
      history: "Appointment History",
      no_history: "No previous appointments recorded.",
      save_changes: "Save Changes",
      create_customer: "Create Profile",
      confirm_delete: "Confirm Deletion",
      confirm_delete_desc: "Are you sure you want to delete this customer profile? This action cannot be undone.",
      customer_added: "Customer added!",
      customer_updated: "Customer updated!",
      no_customers: "No customers found.",
      search_placeholder: "Search by name or phone..."
    },
    common: {
      loading: "Loading...",
      error_title: "Oops! Something went wrong",
      error_desc: "We apologize, but the application encountered a problem while loading.",
      reload: "Reload page"
    },
    languages: {
      pt: "Portuguese",
      en: "English",
      es: "Spanish",
      fr: "French"
    }
  },
  es: {
    landing: {
      welcome: "¡Bienvenido!",
      incorrect_password: "Contraseña incorrecta.",
      access: "Acceso",
      team_password: "Contraseña del Equipo",
      enter: "Entrar",
      slogan: "Tu belleza, <br/>nuestra firma.",
      slogan_desc: "Un espacio dedicado a realzar lo mejor de ti, con profesionales de excelencia y productos premium.",
      how_to_access: "¿Cómo deseas acceder a la plataforma hoy?",
      i_am_client: "Soy Cliente",
      client_desc: "Quiero programar una cita para mi cabello o tratamiento.",
      i_am_team: "Soy del Equipo",
      team_desc: "Acceso al panel de gestión del salón y agenda.",
      location: "Maputo, Mozambique"
    },
    nav: {
      dashboard: "Panel",
      calendar: "Agenda",
      book: "Reservar",
      new_reservation: "Nueva Reserva",
      professionals: "Profesionales",
      services: "Servicios",
      management: "Gestión",
      customers: "Clientes",
      exit: "Salir",
      back: "Volver",
      home: "Inicio",
      team: "Equipo"
    },
    booking: {
      fill_data: "Por favor complete sus datos.",
      invalid_phone: "Número de teléfono inválido. Por favor ingrese un número válido.",
      confirming: "Confirmando reserva...",
      success_toast: "¡Reserva completada con éxito!",
      error_toast: "Error al guardar la reserva. Inténtelo de nuevo.",
      success_title: "¡Reserva Confirmada!",
      success_desc: "Hola <strong class='text-tulip-900'>{name}</strong>, su cita para <strong>{service}</strong> con <strong>{professional}</strong> está reservada para el <strong>{date}</strong> a las <strong>{time}</strong>.",
      success_note: "Guarde su número de móvil para comprobar el estado. Puede seguir todo en la pestaña <strong>Mis Reservas</strong>.",
      view_appointments: "Ver Mis Reservas",
      new_booking: "Hacer Nueva Reserva",
      step: "Paso {current} de {total}",
      step1_title: "Elegir Servicio",
      step2_title: "Elegir Profesional",
      step3_title: "¿Cuál es la Fecha?",
      step4_title: "Elegir Hora",
      step5_title: "Sus Datos",
      price: "Precio",
      duration: "Duración",
      next: "Siguiente",
      no_professionals: "No hay profesionales disponibles para este servicio.",
      select_time: "Seleccionar hora",
      no_slots: "No hay plazas disponibles en este día. Por favor elija otra fecha.",
      your_name: "Su nombre completo",
      your_phone: "Número de móvil",
      confirm_booking: "Confirmar Reserva",
      expert_available: "Especialista disponible",
      day_off: "Libre",
      time_on: "Horarios el",
      at: "a las",
      with: "con",
      choose_another_date: "Elegir otra fecha",
      status_pending: "Pendiente"
    },
    dashboard: {
      overview: "Gestione todas las reservas del salón de forma segura.",
      clients_today: "Clientes Hoy",
      pending_today: "Pendientes",
      total_appointments: "Total de Reservas",
      search: "Buscar cliente o teléfono...",
      status_all: "Estado (Todos)",
      no_results: "No se encontraron reservas.",
      confirm: "Confirmar",
      cancel: "Cancelar",
      reactivate: "Reactivar",
      delete: "Eliminar",
      client: "Cliente",
      contact: "Contacto",
      service: "Servicio",
      professional: "Profesional",
      date_time: "Fecha y Hora",
      status: "Estado",
      action: "Acción",
      created_at: "Creado en"
    },
    client_appointments: {
      title: "Mis Reservas",
      subtitle: "Realice un seguimiento del estado de sus reservas realizadas en este dispositivo.",
      placeholder: "Su nombre (Ej: María García)",
      search: "Buscar",
      no_results: "No se encontraron reservas en este dispositivo.",
      check_name: "Asegúrese de que el nombre esté escrito exactamente como en el momento de la reserva.",
      appointment: "Cita",
      ref: "Ref"
    },
    calendar: {
      this_week: "Esta Semana",
      whole_team: "Equipo Completo",
      today_schedule: "Horarios de Hoy",
      appointments: "reservas",
      free_slot: "Horario Libre"
    },
    management_services: {
      subtitle: "Gestione los servicios ofrecidos en el salón.",
      add_service: "Agregar Servicio",
      service_removed: "Servicio eliminado con éxito.",
      new_service: "Nuevo Servicio",
      edit_service: "Editar Servicio",
      service_name: "Nombre del Servicio",
      price: "Precio",
      duration_min: "Duración (min)",
      category: "Categoría (opcional)",
      save_changes: "Guardar Cambios",
      create_service: "Crear Servicio",
      confirm_delete: "Confirmar Eliminación",
      confirm_delete_desc: "¿Está seguro de que desea eliminar este servicio? Esta acción no se puede deshacer.",
      service_added: "¡Servicio agregado!",
      service_updated: "¡Servicio actualizado!",
      no_services: "No se encontraron servicios."
    },
    management_professionals: {
      subtitle: "Gestione los profesionales y sus especialidades.",
      add_professional: "Agregar Profesional",
      prof_removed: "Profesional eliminado con éxito.",
      new_prof: "Nuevo Profesional",
      edit_prof: "Editar Profesional",
      prof_name: "Nombre Completo",
      prof_photo: "Foto del Profesional",
      prof_email: "Correo Electrónico",
      prof_phone: "Teléfono Móvil",
      role: "Cargo (ej: Estilista, Manicurista)",
      specialties: "Especialidades (Servicios)",
      select_services: "Seleccione los servicios",
      no_services_yet: "Agregue servicios primero.",
      schedule: "Horario de Trabajo",
      start_time: "Inicio (HH:mm)",
      end_time: "Fin (HH:mm)",
      working_days: "Días de Trabajo",
      mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom",
      create_prof: "Crear Profesional",
      confirm_delete: "Confirmar Eliminación",
      confirm_delete_desc: "¿Está seguro de que desea eliminar este profesional? Esta acción no se puede deshacer.",
      prof_added: "¡Profesional agregado!",
      prof_updated: "¡Profesional actualizado!",
      no_professionals: "No se encontraron profesionales."
    },
    management_customers: {
      subtitle: "Gestione los perfiles e historial de sus clientes.",
      add_customer: "Agregar Cliente",
      customer_removed: "Perfil del cliente eliminado.",
      new_customer: "Nuevo Cliente",
      edit_customer: "Editar Cliente",
      customer_name: "Nombre Completo",
      customer_phone: "Teléfono Móvil",
      customer_notes: "Notas y Preferencias",
      history: "Historial de Reservas",
      no_history: "No se registraron reservas previas.",
      save_changes: "Guardar Cambios",
      create_customer: "Crear Perfil",
      confirm_delete: "Confirmar Eliminación",
      confirm_delete_desc: "¿Está seguro de que desea eliminar este perfil de cliente? Esta acción no se puede deshacer.",
      customer_added: "¡Cliente agregado!",
      customer_updated: "¡Cliente actualizado!",
      no_customers: "No se encontraron clientes.",
      search_placeholder: "Buscar por nombre o teléfono..."
    },
    common: {
      loading: "Cargando...",
      error_title: "¡Ups! Algo salió mal",
      error_desc: "Lo sentimos, pero la aplicación encontró un problema al cargar.",
      reload: "Recargar página"
    },
    languages: {
      pt: "Portugués",
      en: "Inglés",
      es: "Español",
      fr: "Francés"
    }
  },
  fr: {
    landing: {
      welcome: "Bienvenue !",
      incorrect_password: "Mot de passe incorrect.",
      access: "Accès",
      team_password: "Mot de passe du personnel",
      enter: "Entrer",
      slogan: "Votre beauté, <br/>notre signature.",
      slogan_desc: "Un espace dédié pour sublimer le meilleur de vous, avec des professionnels dexcellence et des produits premium.",
      how_to_access: "Comment souhaitez-vous accéder à la plateforme aujourdhui ?",
      i_am_client: "Je suis Client",
      client_desc: "Je souhaite prendre rendez-vous pour mes cheveux ou un soin.",
      i_am_team: "Membre de l'équipe",
      team_desc: "Accéder au tableau de bord et à lagenda du salon.",
      location: "Maputo, Mozambique"
    },
    nav: {
      dashboard: "Tableau de board",
      calendar: "Calendrier",
      book: "Réserver",
      new_reservation: "Nouvelle réservation",
      professionals: "Professionnels",
      services: "Services",
      management: "Gestion",
      customers: "Clients",
      exit: "Quitter",
      back: "Retour",
      home: "Accueil",
      team: "Équipe"
    },
    booking: {
      fill_data: "Veuillez remplir vos coordonnées.",
      invalid_phone: "Numéro de téléphone invalide. Veuillez entrer un numéro valide.",
      confirming: "Confirmation de la réservation...",
      success_toast: "Réservation complétée avec succès !",
      error_toast: "Erreur lors de l'enregistrement. Veuillez réessayer.",
      success_title: "Réservation confirmée !",
      success_desc: "Bonjour <strong class='text-tulip-900'>{name}</strong>, votre rendez-vous pour <strong>{service}</strong> avec <strong>{professional}</strong> est réservé pour le <strong>{date}</strong> à <strong>{time}</strong>.",
      success_note: "Gardez votre numéro de portable pour vérifier le statut. Vous pouvez tout suivre dans l'onglet <strong>Mes Réservations</strong>.",
      view_appointments: "Voir mes réservations",
      new_booking: "Faire une nouvelle réservation",
      step: "Étape {current} sur {total}",
      step1_title: "Choisir un service",
      step2_title: "Choisir un professionnel",
      step3_title: "Quelle est la date ?",
      step4_title: "Choisir l'heure",
      step5_title: "Vos détails",
      price: "Prix",
      duration: "Durée",
      next: "Suivant",
      no_professionals: "Aucun professionnel disponible pour ce service.",
      select_time: "Sélectionner l'heure",
      no_slots: "Aucun créneau disponible ce jour-là. Veuillez choisir une autre date.",
      your_name: "Votre nom complet",
      your_phone: "Numéro de portable",
      confirm_booking: "Confirmer la réservation",
      expert_available: "Expert disponible",
      day_off: "Repas/Congé",
      time_on: "Horaires du",
      at: "à",
      with: "avec",
      choose_another_date: "Choisir une autre date",
      status_pending: "En attente"
    },
    dashboard: {
      overview: "Gérez toutes les réservations du salon.",
      clients_today: "Clients aujourd'hui",
      pending_today: "En attente",
      total_appointments: "Total des réservations",
      search: "Rechercher un client ou un téléphone...",
      status_all: "Statut (Tous)",
      no_results: "Aucune réservation trouvée.",
      confirm: "Confirmer",
      cancel: "Annuler",
      reactivate: "Réactiver",
      delete: "Supprimer",
      client: "Client",
      contact: "Contact",
      service: "Service",
      professional: "Professionnel",
      date_time: "Date & Heure",
      status: "Statut",
      action: "Action",
      created_at: "Créé le"
    },
    client_appointments: {
      title: "Mes Réservations",
      subtitle: "Suivez le statut de vos réservations effectuées sur cet appareil.",
      placeholder: "Votre nom (Ex : Marie Dubois)",
      search: "Chercher",
      no_results: "Aucune réservation trouvée sur cet appareil.",
      check_name: "Vérifiez que le nom est écrit exactement comme au moment de la réservation.",
      appointment: "Rendez-vous",
      ref: "Réf"
    },
    calendar: {
      this_week: "Cette Semaine",
      whole_team: "Équipe Complète",
      today_schedule: "Horaires d'aujourd'hui",
      appointments: "réservations",
      free_slot: "Créneau Libre"
    },
    management_services: {
      subtitle: "Gérer les services proposés dans le salon.",
      add_service: "Ajouter un service",
      service_removed: "Service supprimé avec succès.",
      new_service: "Nouveau service",
      edit_service: "Modifier le service",
      service_name: "Nom du service",
      price: "Prix",
      duration_min: "Durée (min)",
      category: "Catégorie (optionnel)",
      save_changes: "Enregistrer les modifications",
      create_service: "Créer un service",
      confirm_delete: "Confirmer la suppression",
      confirm_delete_desc: "Êtes-vous sûr de vouloir supprimer ce service ? Cette action ne peut pas être annulée.",
      service_added: "Service ajouté !",
      service_updated: "Service mis à jour !",
      no_services: "Aucun service trouvé."
    },
    management_professionals: {
      subtitle: "Gérer les professionnels et leurs spécialités.",
      add_professional: "Ajouter un professionnel",
      prof_removed: "Professionnel supprimé avec succès.",
      new_prof: "Nouveau professionnel",
      edit_prof: "Modifier le professionnel",
      prof_name: "Nom Complet",
      prof_photo: "Photo du professionnel",
      prof_email: "E-mail",
      prof_phone: "Numéro de mobile",
      role: "Rôle (ex: Styliste, Manucure)",
      specialties: "Spécialités (Services)",
      select_services: "Sélectionner les services",
      no_services_yet: "Ajoutez d'abord des services.",
      schedule: "Horaires de travail",
      start_time: "Début (HH:mm)",
      end_time: "Fin (HH:mm)",
      working_days: "Jours de travail",
      mon: "Lun", tue: "Mar", wed: "Mer", thu: "Jeu", fri: "Ven", sat: "Sam", sun: "Dim",
      create_prof: "Créer un professionnel",
      confirm_delete: "Confirmer la suppression",
      confirm_delete_desc: "Êtes-vous sûr de vouloir supprimer ce professionnel ? Cette action ne peut pas être annulée.",
      prof_added: "Professionnel ajouté !",
      prof_updated: "Professionnel mis à jour !",
      no_professionals: "Aucun professionnel trouvé."
    },
    management_customers: {
      subtitle: "Gérez les profils et l'historique de vos clients.",
      add_customer: "Ajouter un client",
      customer_removed: "Profil client supprimé.",
      new_customer: "Nouveau client",
      edit_customer: "Modifier le client",
      customer_name: "Nom complet",
      customer_phone: "Numéro de mobile",
      customer_notes: "Notes & Préférences",
      history: "Historique des réservations",
      no_history: "Aucune réservation précédente enregistrée.",
      save_changes: "Enregistrer les modifications",
      create_customer: "Créer le profil",
      confirm_delete: "Confirmer la suppression",
      confirm_delete_desc: "Êtes-vous sûr de vouloir supprimer ce profil client ? Cette action ne peut pas être annulée.",
      customer_added: "Client ajouté !",
      customer_updated: "Client mis à jour !",
      no_customers: "Aucun client trouvé.",
      search_placeholder: "Rechercher par nom ou téléphone..."
    },
    common: {
      loading: "Chargement...",
      error_title: "Oups ! Quelque chose a mal tourné",
      error_desc: "Nous nous excusons, mais l'application a rencontré un problème lors du chargement.",
      reload: "Recharger la page"
    },
    languages: {
      pt: "Portugais",
      en: "Anglais",
      es: "Espagnol",
      fr: "Français"
    }
  }
};

type Translations = typeof translations.pt;
type TranslationKeys = keyof Translations;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  dateLocale: Locale;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  const stored = localStorage.getItem('app_language') as Language;
  if (stored && ['pt', 'en', 'es', 'fr'].includes(stored)) {
    return stored;
  }
  
  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  if (['pt', 'en', 'es', 'fr'].includes(browserLang)) {
    return browserLang as Language;
  }
  
  return 'pt';
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const dateLocale = language === 'en' ? enUS : language === 'es' ? es : language === 'fr' ? fr : ptMZ;

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    // Fallback logic
    if (!value && language !== 'pt') {
       value = translations['pt'];
    }

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Try fallback to pt
        let fallbackValue: any = translations['pt'];
        for (const fk of keys) {
             if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
                 fallbackValue = fallbackValue[fk];
             } else {
                 fallbackValue = key;
                 break;
             }
        }
        return fallbackValue as string;
      }
    }

    let translation = value as string;
    
    if (replacements && translation) {
      Object.entries(replacements).forEach(([k, v]) => {
        translation = translation.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    return translation || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dateLocale }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

