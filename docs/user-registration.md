# Flujo Detallado

## Crear usuario y asignar roles:
- El sistema crea un usuario **inactivo** y le asigna roles iniciales.
- Asociar al usuario con un tenant, si es necesario desde este punto.

## Enviar un correo de verificación:
- Enviar un correo con:
  - Un **enlace para verificar el correo** (firma única, segura, con expiración).
  - Un **código de acceso al tenant** (puede ser el mismo que el de verificación del correo o un código separado, dependiendo de tus necesidades).

## Usuario verifica el correo:
- Al hacer clic en el enlace del correo, el sistema marca el correo como **verificado**.
- El usuario queda **activo**, pero **no tiene acceso al tenant todavía**.

## Usuario ingresa el código de acceso al tenant:
- El usuario accede a una interfaz donde debe ingresar el **código proporcionado**.
- El sistema valida:
  - Que el código sea válido y no haya expirado.
  - Que el código esté asociado al usuario correcto.
  - Que el código esté asociado al tenant correspondiente.

## Usuario obtiene acceso al tenant:
- Si el código es válido, el sistema **activa el acceso** del usuario al tenant y lo registra como miembro autorizado.

## Inicio de sesión normal:
- Después de estos pasos, el usuario puede iniciar sesión en el tenant normalmente, sin necesidad de códigos adicionales.

---

# Ventajas del Flujo

## Seguridad mejorada:
- La verificación de correo asegura que el usuario posee una dirección válida.
- El código adicional para el tenant garantiza un segundo nivel de validación.

## Flexibilidad:
- Permite manejar múltiples tenants, ya que el acceso se gestiona por códigos específicos.

## Auditoría clara:
- Puedes registrar los pasos completados (correo verificado, código ingresado) para seguimiento y resolución de problemas.

---

# Consideraciones Técnicas

## Código único por tenant:
- Genera un código único por tenant y usuario. Opcionalmente, incluye una **expiración** (por ejemplo, 24-48 horas).
- Almacénalo **cifrado** en la base de datos.

## Mensajes claros:
- Guía al usuario en cada paso con mensajes claros y recordatorios de qué necesita completar para obtener acceso.

## Opciones de recuperación:
- Si el usuario pierde el código, proporciona una opción para regenerarlo o reenviarlo al correo registrado.
