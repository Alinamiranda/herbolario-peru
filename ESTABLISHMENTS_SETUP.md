# HU-01: preparación de Supabase

Antes de aplicar la migración `supabase/migrations/20261121000000_establishments.sql`, revisa el esquema remoto y las políticas y privilegios reales de `public.profiles` y verifica que no exista ya una tabla equivalente. No se ha aplicado ninguna migración. Si existe otra estructura, adapta la implementación y la migración antes de ejecutarla.

La consulta de diagnóstico previa a la raíz `/rest/v1/` respondió 401 porque ese endpoint de inspección exige una clave secreta, no porque la clave publicable sea inválida. Las comprobaciones de solo lectura a Auth y a `profiles` respondieron 200. No coloques una clave secreta en las variables `NEXT_PUBLIC_` ni la compartas para inspeccionar el esquema. La respuesta anónima de `profiles` no demuestra que un usuario autenticado pueda insertar ni que el esquema remoto sea el esperado.

Para inspeccionar el esquema con tu acceso administrativo, ejecuta estas consultas de solo lectura en el editor SQL de Supabase:

```sql
select table_name from information_schema.tables
where table_schema = 'public' and table_type = 'BASE TABLE'
order by table_name;

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public'
  and tablename in ('profiles', 'establishments')
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('profiles', 'establishments')
order by table_name, grantee, privilege_type;
```

Revisa también los privilegios por columna y los roles heredados en la configuración del proyecto; las consultas anteriores no son una auditoría exhaustiva de permisos.

Una vez revisada, aplica la migración con el flujo de migraciones o el editor SQL de Supabase. Habilita la inserción solo para usuarios autenticados con rol `seller` o `admin`, limita `owner_id` al usuario autenticado y permite leer únicamente los establecimientos propios. El índice evita duplicados con el mismo propietario, nombre y ubicación, ignorando mayúsculas y espacios exteriores. Todavía no se concede lectura pública para un futuro directorio.

Verifica con cuentas de prueba de cada rol: vendedor y administrador pueden crear sus propios registros; comprador y usuario anónimo no pueden insertar; nadie puede insertar a nombre de otro usuario; y solo el propietario puede leer. Comprueba también los privilegios heredados, la ausencia de políticas adicionales y la integridad de la relación con `profiles`. Las pruebas locales usan dobles, no comprueban RLS ni la base de datos remota.

La ubicación se introduce como texto, sin afirmar que corresponda a un catálogo oficial. Para el teléfono se admiten números nacionales de 8 o 9 dígitos, con prefijo `+51` opcional; se guarda solo la parte nacional. Los números fijos deben incluir código de área cuando corresponda.
