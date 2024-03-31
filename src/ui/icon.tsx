import { toUpperCamelCase } from '../lib/string-casing'
// @ts-ignore
import icons from 'lucide-react/dist/cjs/lucide-react'

export const Icon: React.FC<any> = ({ name, className = '', ...props }) => {	
	const IconComponent = icons[toUpperCamelCase(name)]
	return <IconComponent className={className} {...props} />
}