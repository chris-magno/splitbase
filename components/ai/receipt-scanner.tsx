'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, Loader2, Sparkles, AlertCircle, Check } from 'lucide-react'
import { ParsedReceipt } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { fileToBase64 } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface ReceiptScannerProps {
  members: { id: string; name: string }[]
  onConfirm: (receipt: ParsedReceipt, description: string) => Promise<void>
}

export function ReceiptScanner({ members, onConfirm }: ReceiptScannerProps) {
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null)
  const [confirming, setConfirming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 5MB', variant: 'destructive' })
      return
    }
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImage(url)
    setParsed(null)
  }

  const handleScan = async () => {
    if (!imageFile) return
    setScanning(true)
    try {
      const base64 = await fileToBase64(imageFile)
      const res = await fetch('/api/ai/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: imageFile.type, members: members.map((m) => m.name) }),
      })
      const data = await res.json()
      if (data.success) setParsed(data.data)
      else toast({ title: 'Scan failed', description: data.error, variant: 'destructive' })
    } catch {
      toast({ title: 'Error', description: 'Failed to scan receipt', variant: 'destructive' })
    } finally {
      setScanning(false)
    }
  }

  const handleConfirm = async () => {
    if (!parsed) return
    setConfirming(true)
    try {
      const desc = `Receipt: ${parsed.lineItems.slice(0, 3).map(i => i.name).join(', ')}${parsed.lineItems.length > 3 ? '...' : ''}`
      await onConfirm(parsed, desc)
      toast({ title: 'Receipt saved!', description: `$${parsed.total} split added` })
      setImage(null)
      setImageFile(null)
      setParsed(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' })
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="space-y-4">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />

      {!image ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-colors"
        >
          <Camera className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">Tap to upload receipt photo</p>
          <p className="text-sm text-gray-400 mt-1">JPEG, PNG, or WebP · Max 5MB</p>
          <Button size="sm" variant="outline" className="mt-4 gap-2">
            <Upload className="h-4 w-4" />Choose Image
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-gray-100">
            <img src={image} alt="Receipt" className="w-full max-h-48 object-cover" />
            <button
              onClick={() => { setImage(null); setImageFile(null); setParsed(null) }}
              className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center"
            >✕</button>
          </div>

          {!parsed && (
            <Button onClick={handleScan} disabled={scanning} className="w-full gradient-brand text-white border-0 gap-2">
              {scanning ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Gemini is reading receipt...</>
              ) : (
                <><Sparkles className="h-4 w-4" />Scan with Gemini Vision</>
              )}
            </Button>
          )}
        </div>
      )}

      {parsed && (
        <Card className="border-green-100 bg-green-50/50 animate-fade-in-up">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Receipt Scanned</span>
              <Badge variant={parsed.confidence >= 0.8 ? 'success' : 'warning'}>
                {Math.round(parsed.confidence * 100)}% confidence
              </Badge>
            </div>

            {parsed.confidence < 0.5 && (
              <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 rounded-lg p-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Low quality scan — consider retaking the photo
              </div>
            )}

            <div className="space-y-1 max-h-32 overflow-y-auto">
              {parsed.lineItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name}{item.quantity && item.quantity > 1 ? ` x${item.quantity}` : ''}</span>
                  <span className="font-medium">{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 space-y-1 text-sm">
              {parsed.tax > 0 && <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatCurrency(parsed.tax)}</span></div>}
              {parsed.tip > 0 && <div className="flex justify-between text-gray-500"><span>Tip</span><span>{formatCurrency(parsed.tip)}</span></div>}
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(parsed.total)}</span></div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setParsed(null)} size="sm" className="flex-1">Re-scan</Button>
              <Button onClick={handleConfirm} disabled={confirming} size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 gap-1">
                {confirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save Split
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
