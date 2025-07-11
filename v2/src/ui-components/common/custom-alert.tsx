/*
 * Copyright 2024 RSC-Labs, https://rsoftcon.com/
 *
 * MIT License
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type AlertVariant = 'error' | 'info' | 'warning' | 'success';

interface CustomAlertProps {
  variant: AlertVariant;
  children: any;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  success: 'bg-green-50 border-green-200 text-green-800'
};

const variantIcons: Record<AlertVariant, string> = {
  error: '⚠️',
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅'
};

export const CustomAlert = ({ variant, children, className = '' }: CustomAlertProps) => {
  const baseStyles = 'border rounded-lg p-4 flex items-start gap-3';
  const variantStyle = variantStyles[variant];
  const icon = variantIcons[variant];

  return (
    <div className={`${baseStyles} ${variantStyle} ${className}`} role="alert">
      <span className="flex-shrink-0 text-lg" aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 text-sm">
        {children}
      </div>
    </div>
  );
}; 