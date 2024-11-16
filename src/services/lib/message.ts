import Swal from 'sweetalert2';
import type { SweetAlertOptions } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

type callback = () => void | Promise<void>;

const CustomSwal = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    actions: 'flex gap-2',
    container: 'flex justify-center items-center gap-2',
    confirmButton: 'flex items-center gap-2 justify-center rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90',
    cancelButton: 'flex items-center gap-2 justify-center rounded bg-gray-300 py-2 px-6 font-medium text-gray-800 hover:bg-opacity-90',
    denyButton: 'flex items-center gap-2 justify-center rounded bg-gray-300 py-2 px-6 font-medium text-gray-800 hover:bg-opacity-90',
    input: 'rounded',
  },
});

const MySwal = withReactContent(CustomSwal);

export const triggerError = (error: string, title = 'Error!', options?: SweetAlertOptions) => {
  return MySwal.fire({
    title: title,
    text: error,
    icon: 'error',
    ...options,
  });
};

export const triggerLoading = (loading: string, title = 'Cargando...', options?: SweetAlertOptions) => {
  return MySwal.fire({
    title: title,
    text: loading,
    icon: 'info',
    ...options,
  });
};

export const triggerSuccess = (success: string, title = 'Todo correcto!', options?: SweetAlertOptions) => {
  return MySwal.fire({
    title: title,
    text: success,
    icon: 'success',
    ...options,
  });
};

export const triggerWarning = (warning: string, title = 'Alerta!', options?: SweetAlertOptions) => {
  return MySwal.fire({
    title: title,
    text: warning,
    icon: 'warning',
    ...options,
  });
};

export const triggerConfirm = async (confirm: string, title = 'Confirmar!', options?: SweetAlertOptions) => {
  return await MySwal.fire({
    title: title,
    text: confirm,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Si',
    cancelButtonText: 'No',
    ...options,
  });
};

export const triggerConfirmCallback = async (confirm: string, title = 'Confirmar!', callback: callback, options?: SweetAlertOptions) => {
  const result = await MySwal.fire({
    title: title,
    text: confirm,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Si',
    cancelButtonText: 'No',
    toast: true,
    ...options,
  });
  if (result.isConfirmed) {
    await callback();
  }
};

export const triggerRequest = async (request: string, title = 'Petición!', options?: SweetAlertOptions) => {
  return MySwal.fire({
    title: title,
    input: 'text',
    inputLabel: request,
    inputAttributes: {
      autocapitalize: 'off',
    },
    showCancelButton: true,
    confirmButtonText: 'Entiendo y acepto',
    confirmButtonColor: '#ef4444',
    ...options,
  });
};

export default MySwal;
