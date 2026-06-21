import { Field, FieldDescription, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  authMethodOptions,
  type AuthFieldName,
  type AuthFormValues,
  type AuthMethod,
} from '#/features/scanner/dynamic/schemas/dynamic-scanner-schema'

type AuthSectionProps = {
  values: AuthFormValues
  errors: Partial<Record<AuthFieldName, string>>
  onMethodChange: (method: AuthMethod) => void
  onFieldChange: (field: AuthFieldName, value: string) => void
}

export function AuthSection({ values, errors, onMethodChange, onFieldChange }: AuthSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-0.5">
        <h3 className="text-xs font-medium">Authentication</h3>
        <p className="text-muted-foreground text-xs">Scan pages behind a login (optional)</p>
      </div>

      <Field className="w-full">
        <FieldLabel htmlFor="auth-method">Auth Method</FieldLabel>
        <Select
          value={values.method}
          onValueChange={(value) => onMethodChange(value as AuthMethod)}
        >
          <SelectTrigger id="auth-method" className="w-full max-w-48">
            <SelectValue placeholder="Select auth method" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Authentication method</SelectLabel>
              {authMethodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {values.method === 'cookie' ? (
        <Field data-invalid={Boolean(errors.cookie)}>
          <FieldLabel htmlFor="auth-cookie">Cookie</FieldLabel>
          <Textarea
            id="auth-cookie"
            placeholder="PHPSESSID=abc123; other=value"
            value={values.cookie}
            onChange={(event) => onFieldChange('cookie', event.target.value)}
          />
          <FieldDescription>
            Paste as name=value (e.g. PHPSESSID=abc123). Separate multiple cookies with &apos;;
            &apos;. Copy from DevTools → Application → Cookies.
          </FieldDescription>
          {errors.cookie ? <FieldError errors={[{ message: errors.cookie }]} /> : null}
        </Field>
      ) : null}

      {values.method === 'bearer' ? (
        <Field data-invalid={Boolean(errors.token)}>
          <FieldLabel htmlFor="auth-token">Token</FieldLabel>
          <Input
            id="auth-token"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            value={values.token}
            onChange={(event) => onFieldChange('token', event.target.value)}
          />
          <FieldDescription>
            Paste the token only, without the &apos;Bearer&apos; prefix.
          </FieldDescription>
          {errors.token ? <FieldError errors={[{ message: errors.token }]} /> : null}
        </Field>
      ) : null}

      {values.method === 'basic' ? (
        <>
          <Field data-invalid={Boolean(errors.username)}>
            <FieldLabel htmlFor="auth-username">Username</FieldLabel>
            <Input
              id="auth-username"
              autoComplete="off"
              value={values.username}
              onChange={(event) => onFieldChange('username', event.target.value)}
            />
            <FieldDescription>Username must not contain a colon &apos;:&apos;.</FieldDescription>
            {errors.username ? <FieldError errors={[{ message: errors.username }]} /> : null}
          </Field>
          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="auth-password">Password</FieldLabel>
            <Input
              id="auth-password"
              type="password"
              autoComplete="off"
              value={values.password}
              onChange={(event) => onFieldChange('password', event.target.value)}
            />
            {errors.password ? <FieldError errors={[{ message: errors.password }]} /> : null}
          </Field>
        </>
      ) : null}

      {values.method === 'header' ? (
        <>
          <Field data-invalid={Boolean(errors.headerName)}>
            <FieldLabel htmlFor="auth-header-name">Header Name</FieldLabel>
            <Input
              id="auth-header-name"
              placeholder="X-API-Key"
              value={values.headerName}
              onChange={(event) => onFieldChange('headerName', event.target.value)}
            />
            {errors.headerName ? <FieldError errors={[{ message: errors.headerName }]} /> : null}
          </Field>
          <Field data-invalid={Boolean(errors.headerValue)}>
            <FieldLabel htmlFor="auth-header-value">Header Value</FieldLabel>
            <Input
              id="auth-header-value"
              value={values.headerValue}
              onChange={(event) => onFieldChange('headerValue', event.target.value)}
            />
            {errors.headerValue ? <FieldError errors={[{ message: errors.headerValue }]} /> : null}
          </Field>
        </>
      ) : null}
    </div>
  )
}
