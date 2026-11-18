# Error al Sembrar Usuarios:

# El error se produce porque broadcasts_refreshes_to se apoya internamente en Turbo::StreamsChannel, 
# el cual intenta realizar transmisiones de Action Cable (broadcast_refresh_later_to) inmediatas o en segundo plano. 
# Durante la ejecución de rails db:seed, Action Cable no está iniciado y el entorno falla.

# En el modelo User precisamos ejecutar callbacks (after_commit) porque allí se crean los attachments.
# Por tanto, no podemos usar insert_all ni limpiar todo el arreglo de callbacks de ActiveRecord para evitar el error.
# (Podriamos limpiar el arreglo selectivamente. Ver notas al pie del archivo.)
#
# El supresor nativo de Turbo tampoco es la solucion ya para broadcast_refresh_to encola jobs asincronos 
# y pasa x un debouncer.  (User.suppressing_turbo_broadcasts do)

# Usamos una variable de entorno.
# Ahora debemos ejecutar este archivo mediante: RUNNING_SEEDS=true rails db:seed


mateo = User.create(email: 'mateo@example.com',
            username: "Mateo",
            password: "mateo123",
            password_confirmation: "mateo123",
            role: User.roles[:admin])

vero = User.create(email: 'vero@example.com',
            username: 'Vero',
            password: 'vero123',
            password_confirmation: 'vero123')

cata = User.create(email: 'cata@example.com',
            username: "Cata",
            password: 'cata123',
            password_confirmation: 'cata123')

emi = User.create(email: 'emi@example.com',
            username: "Emi",
            password: 'emi123',
            password_confirmation: 'emi123')

users = User.count
if users < 5 
    10.times do
        user = User.create!(email: Faker::Internet.email,
            username: Faker::Name.name,                
            password: 'password',
            password_confirmation: 'password')
    end
end

arena = Room.create(name: 'Arena', is_private: false)
mateo.joined_rooms << arena
vero.joined_rooms << arena
cata.joined_rooms << arena
mateo.joined_rooms << Room.create(name: 'General', is_private: false)


VARIANTS = [
  { "speed": "bullet",
    "name": "1+0", 
    "description": {
      "en": "1 minute game",
      "es": "Juego de 1 minuto" },
    "timer": 60, 
    "time_increment": 0 
  },
  { "speed": "bullet", 
    "name": "2+1", 
    "description": {
      "en": "2 minutes game with 1 second increment",
      "es": "A 2 minutos con 1 segundo de incremento" },
    "timer": 120, 
    "time_increment": 1 
  },
  { "speed": "blitz", 
    "name": "3+0", 
    "description": {
      "en": "3 minutes game",
      "es": "Juego de 3 minutos" },
    "timer": 180,
    "time_increment": 0 
  },
  { "speed": "blitz", 
    "name": "3+2", 
    "description": {
      "en": "3 minutes game with 2 seconds increment", 
      "es": "A 3 minutos con 2 segundos de incremento" },
    "timer": 180, 
    "time_increment": 2 
  },
  { "speed": "blitz", 
    "name": "5+0",
    "description": { 
      "en": "5 minutes game",
      "es": "Juego de 5 minutos" },
    "timer": 300, 
    "time_increment": 0 
  },
  { "speed": "blitz", 
    "name": "5+3", 
    "description": {
      "en": "5 minutes game with 3 seconds increment", 
      "es": "A 5 minutos con 3 segundos de incremento" },
    "timer": 300, 
    "time_increment": 3 
  },
  { "speed": "rapid", 
    "name": "10+0",
    "description": { 
      "en": "10 minutes game", 
      "es": "Juego de 10 minutos" },
    "timer": 600,
    "time_increment": 0 
  },
  { "speed": "rapid", 
    "name": "10+5",
    "description": { 
      "en": "10 minutes game with 5 seconds increment", 
      "es": "A 10 minutos con 5 segundos de incremento" },
    "timer": 600,
    "time_increment": 5 
  },
  { "speed": "rapid", 
    "name": "15+10",
    "description": { 
      "en": "15 minutes game with 10 seconds increment", 
      "es": "A 15 minutos con 10 segundos de incremento" },
    "timer": 900, 
    "time_increment": 10 
  },
  { "speed": "classic", 
    "name": "30+0", 
    "description": { 
      "en": "30 minutes game",
      "es": "Juego de 30 minutos" },
    "timer": 1800, 
    "time_increment": 0
  },
  { "speed": "classic", 
    "name": "30+20", 
    "description": { 
      "en": "30 minutes game with 20 seconds increment",
      "es": "A 30 minutos con 20 segundos de incremento" },
    "timer": 1800, 
    "time_increment": 20
  },
  { "speed": "classic", 
    "name": "1+hour", 
    "description": { 
      "en": "1 hour game with 30 seconds increment",
      "es": "A 1 hora con 30 segundos de incremento" },
    "timer": 3600, 
    "time_increment": 30
  },
  { "speed": "daily", 
    "name": "1+day", 
    "description": { 
      "en": "1 day per move",
      "es": "1 día por movimiento" },
    "timer": 86400,
    "time_increment": 0 
  },
  { 
    "speed": "daily", 
    "name": "3+days", 
    "description": {
      "en": "3 days per move",
      "es": "3 días por movimiento" },
    "timer": 259200, 
    "time_increment": 0 
  },
]

puts "##########    Crating Game Variants    ##########"
VARIANTS.each do |var|
    object = var.dup.except(:description)
    variant = Variant.find_or_create_by!(object)
    puts variant.inspect

    I18n.locale = :es
    variant.description = var[:description][:es]
    variant.save!
    I18n.locale = :en
    variant.description = var[:description][:en]
    variant.save!
end

# turbo_callbacks = User._commit_callbacks.select do |callback|
#   callback.filter.to_s.include?("broadcast_refresh")
# end
#
# turbo_callbacks.each do |callback|
#   User._commit_callbacks.delete(callback)
# end
#
# ---> Do User stuffs here
#
# turbo_callbacks.each do |callback|
#   User._commit_callbacks.push(callback)
# end
