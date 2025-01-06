Análisis conceptual
User:

Es el actor principal dentro del sistema.
Puede o no completar su información adicional (Person) dependiendo de las políticas o necesidades del tenant.
Un User puede actuar en nombre de un Client o ser el mismo Client.
Client:

Representa a la entidad para la cual se levanta una solicitud.
Puede estar dentro o fuera del sistema, lo que significa que un Client puede:
Ser creado por un User interno (cliente indirecto).
Registrarse directamente en el sistema (cliente directo).
Los requisitos específicos de un Client pueden depender del tenant (ejemplo: requerir monthlyIncome, corporateName, etc.).
Person:

Es un detalle adicional para los User.
No es obligatorio, pero enriquece el perfil del usuario para el tenant (ejemplo: nombre completo, identificación, contacto).
Ayuda a centralizar la información de los User que colaboran en diferentes tenants.
