function Input({ label, placeholder, value, onChange }: { label: string; placeholder: string; value?: string; onChange?: (value: string) => void }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                value={value || ''}
                onChange={e => onChange ? onChange(e.target.value) : undefined}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

export default Input;