import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import MovieRoundedIcon from '@mui/icons-material/MovieRounded'
import NotesRoundedIcon from '@mui/icons-material/NotesRounded'
import QuizRoundedIcon from '@mui/icons-material/QuizRounded'
import { useMemo, useState } from 'react'
import { createId } from '../lib/ids.js'
import { readFileAsDataUrl } from '../lib/files.js'
import { DEFAULT_CATEGORIES } from '../lib/categories.js'

const CARD_TITLE_LIMIT = 38
const CARD_DESCRIPTION_LIMIT = 72
const COVER_RECOMMENDED = '800x450'

function createEmptyStage() {
  return {
    id: createId('stage'),
    title: 'Этап',
    blocks: [],
  }
}

function createBlock(type) {
  const base = { id: createId('block'), type }
  if (type === 'text') return { ...base, text: '' }
  if (type === 'practice') return { ...base, prompt: '', hint: '' }
  if (type === 'image') return { ...base, src: '', name: '', mime: '' }
  if (type === 'video') return { ...base, src: '', name: '', mime: '' }
  if (type === 'test')
    return {
      ...base,
      question: '',
      optionsText: 'Вариант 1\nВариант 2\nВариант 3',
      correctIndex: 0,
      wrongHint: '',
    }
  return base
}

export function CourseEditor({
  initialCourse,
  submitLabel = 'Опубликовать',
  onSubmit,
  onCancel,
}) {
  const categories = useMemo(() => DEFAULT_CATEGORIES, [])

  const [title, setTitle] = useState(initialCourse?.title || '')
  const [description, setDescription] = useState(initialCourse?.description || '')
  const [coverImage, setCoverImage] = useState(initialCourse?.coverImage || '')
  const [category, setCategory] = useState(
    initialCourse?.category || categories[0] || 'Программирование',
  )
  const [customCategory, setCustomCategory] = useState('')

  const [stages, setStages] = useState(() => {
    const existing = Array.isArray(initialCourse?.stages) ? initialCourse.stages : null
    if (existing && existing.length > 0) return existing
    return [
      {
        id: createId('stage'),
        title: 'Этап 1',
        blocks: [
          { id: createId('block'), type: 'text', text: 'Описание' },
          { id: createId('block'), type: 'practice', prompt: 'Практика: сделайте …', hint: '' },
        ],
      },
    ]
  })

  const [error, setError] = useState('')
  const isOther = category === 'Другое'
  const [activeStageId, setActiveStageId] = useState(() => stages?.[0]?.id || null)

  async function attachFile({ stageId, blockId, file, kind }) {
    const dataUrl = await readFileAsDataUrl(file)
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s
        return {
          ...s,
          blocks: s.blocks.map((b) => {
            if (b.id !== blockId) return b
            return { ...b, type: kind, src: dataUrl, name: file.name, mime: file.type }
          }),
        }
      }),
    )
  }

  function addStage() {
    setStages((prev) => {
      const idx = prev.length + 1
      const nextStage = { ...createEmptyStage(), title: `Этап ${idx}` }
      setActiveStageId(nextStage.id)
      return [...prev, nextStage]
    })
  }

  function removeStage(stageId) {
    setStages((prev) => {
      const next = prev.filter((s) => s.id !== stageId)
      if (activeStageId === stageId) setActiveStageId(next?.[0]?.id || null)
      return next
    })
  }

  function updateStage(stageId, patch) {
    setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, ...patch } : s)))
  }

  function addBlock(stageId, type) {
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s
        return { ...s, blocks: [...(s.blocks || []), createBlock(type)] }
      }),
    )
  }

  function removeBlock(stageId, blockId) {
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s
        return { ...s, blocks: (s.blocks || []).filter((b) => b.id !== blockId) }
      }),
    )
  }

  function updateBlock(stageId, blockId, patch) {
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s
        return {
          ...s,
          blocks: (s.blocks || []).map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
        }
      }),
    )
  }

  function validateAndSubmit(e) {
    e.preventDefault()
    setError('')

    const cleanTitle = title.trim()
    if (!cleanTitle) return setError('Введите название курса.')

    let finalCategory = category
    if (isOther) {
      finalCategory = customCategory.trim()
      if (!finalCategory) return setError('Введите свою тему для “Другое”.')
    }

    const normalizedStages = (stages || [])
      .map((s, idx) => ({
        id: s.id || createId('stage'),
        title: String(s.title || `Этап ${idx + 1}`).trim() || `Этап ${idx + 1}`,
        blocks: Array.isArray(s.blocks)
          ? s.blocks
              .map((b) => ({ ...b, id: b.id || createId('block') }))
              .filter((b) => String(b.type || '').trim())
          : [],
      }))
      .filter((s) => s.blocks.length > 0 || s.title)

    if (normalizedStages.length === 0) return setError('Добавьте хотя бы один этап.')

    onSubmit?.({
      title: cleanTitle,
      description: description,
      category: finalCategory,
      coverImage: coverImage || null,
      stages: normalizedStages,
    })
  }

  return (
    <Stack spacing={2.5}>
      <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Box component="form" onSubmit={validateAndSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Название курса"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                inputProps={{ maxLength: CARD_TITLE_LIMIT }}
                helperText={`Лимит для карточки: ${title.length}/${CARD_TITLE_LIMIT} символов.`}
                fullWidth
                required
              />

              <TextField
                label="Короткое описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                helperText={`В карточке будет показано до ${CARD_DESCRIPTION_LIMIT} символов, на странице курса — полное описание.`}
                fullWidth
                multiline
                minRows={3}
              />

              <Stack spacing={1}>
                <Typography sx={{ fontWeight: 900 }}>Обложка курса (для карточки)</Typography>
                <Typography variant="body2" color="text.secondary">
                  Поддерживаются любые форматы изображения (JPG, PNG, WEBP и др.), обложка в
                  карточке не обрезается. Рекомендуемый размер: {COVER_RECOMMENDED} (16:9),
                  минимум: 400x225.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                  <Button variant="outlined" component="label">
                    Выбрать картинку
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          const dataUrl = await readFileAsDataUrl(file)
                          setCoverImage(dataUrl)
                        } catch (err) {
                          setError(err?.message || 'Не удалось прикрепить файл.')
                        }
                      }}
                    />
                  </Button>
                  {coverImage ? (
                    <Button variant="text" color="error" onClick={() => setCoverImage('')}>
                      Удалить обложку
                    </Button>
                  ) : null}
                </Stack>
                {coverImage ? (
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 520,
                      height: { xs: 180, md: 220 },
                      borderRadius: 3,
                      border: (t) => `1px solid ${t.palette.divider}`,
                      bgcolor: 'background.default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={coverImage}
                      alt=""
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        p: 0.5,
                        display: 'block',
                      }}
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Обложка не выбрана.
                  </Typography>
                )}
              </Stack>

              <FormControl fullWidth>
                <InputLabel id="category-label">Тема</InputLabel>
                <Select
                  labelId="category-label"
                  value={category}
                  label="Тема"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {isOther && (
                <TextField
                  label="Своя тема (Другое)"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  fullWidth
                  placeholder="Например: Психология, Фотография, Путешествия…"
                />
              )}

              <Divider />

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems="flex-start"
              >
                <Box sx={{ width: { xs: '100%', md: 320 }, flex: '0 0 auto' }}>
                  <Card
                    elevation={0}
                    sx={{
                      border: (t) => `1px solid ${t.palette.divider}`,
                      position: { md: 'sticky' },
                      top: { md: 88 },
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1.25}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography sx={{ fontWeight: 900 }}>Этапы</Typography>
                          <Button
                            startIcon={<AddRoundedIcon />}
                            onClick={addStage}
                            variant="outlined"
                            size="small"
                          >
                            Новый
                          </Button>
                        </Stack>

                        <List dense disablePadding sx={{ borderRadius: 2, overflow: 'hidden' }}>
                          {(stages || []).map((s, idx) => (
                            <ListItemButton
                              key={s.id}
                              selected={s.id === activeStageId}
                              onClick={() => setActiveStageId(s.id)}
                            >
                              <ListItemText
                                primary={s.title || `Этап ${idx + 1}`}
                                secondary={`${(s.blocks || []).length} блок(ов)`}
                              />
                            </ListItemButton>
                          ))}
                        </List>

                        <Typography variant="caption" color="text.secondary">
                          Переключайте этапы в меню слева. Названия этапов видны ученикам.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ flex: '1 1 auto', width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                  {(() => {
                    const stageIndex = (stages || []).findIndex((s) => s.id === activeStageId)
                    const stage =
                      stageIndex >= 0 ? stages[stageIndex] : (stages || [])[0] || null
                    if (!stage) {
                      return (
                        <Typography color="text.secondary">
                          Добавьте этап, чтобы начать собирать курс.
                        </Typography>
                      )
                    }

                    return (
                      <Card
                        elevation={0}
                        sx={{ border: (t) => `1px solid ${t.palette.divider}` }}
                      >
                        <CardContent>
                          <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <TextField
                                label="Название этапа"
                                value={stage.title || ''}
                                onChange={(e) => updateStage(stage.id, { title: e.target.value })}
                                fullWidth
                              />
                              <IconButton
                                aria-label="Удалить этап"
                                onClick={() => removeStage(stage.id)}
                              >
                                <DeleteOutlineRoundedIcon />
                              </IconButton>
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Button
                                size="small"
                                startIcon={<NotesRoundedIcon />}
                                onClick={() => addBlock(stage.id, 'text')}
                                variant="outlined"
                              >
                                Текст
                              </Button>
                              <Button
                                size="small"
                                startIcon={<ImageRoundedIcon />}
                                onClick={() => addBlock(stage.id, 'image')}
                                variant="outlined"
                              >
                                Картинка
                              </Button>
                              <Button
                                size="small"
                                startIcon={<MovieRoundedIcon />}
                                onClick={() => addBlock(stage.id, 'video')}
                                variant="outlined"
                              >
                                Видео
                              </Button>
                              <Button
                                size="small"
                                startIcon={<QuizRoundedIcon />}
                                onClick={() => addBlock(stage.id, 'practice')}
                                variant="outlined"
                              >
                                Практика
                              </Button>
                              <Button
                                size="small"
                                startIcon={<QuizRoundedIcon />}
                                onClick={() => addBlock(stage.id, 'test')}
                                variant="outlined"
                              >
                                Тест
                              </Button>
                            </Stack>

                            <Stack spacing={1.5}>
                              {(stage.blocks || []).map((block) => (
                                <Card
                                  key={block.id}
                                  elevation={0}
                                  sx={{ border: (t) => `1px solid ${t.palette.divider}` }}
                                >
                                  <CardContent>
                                    <Stack spacing={1.25}>
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        spacing={1}
                                      >
                                        <Typography sx={{ fontWeight: 800 }}>
                                          {block.type === 'text' && 'Блок: текст'}
                                          {block.type === 'image' && 'Блок: картинка'}
                                          {block.type === 'video' && 'Блок: видео'}
                                          {block.type === 'practice' && 'Блок: практика'}
                                          {block.type === 'test' && 'Блок: тест'}
                                        </Typography>
                                        <IconButton
                                          aria-label="Удалить блок"
                                          onClick={() => removeBlock(stage.id, block.id)}
                                        >
                                          <DeleteOutlineRoundedIcon />
                                        </IconButton>
                                      </Stack>

                                      {block.type === 'text' && (
                                        <TextField
                                          label="Текст"
                                          value={block.text || ''}
                                          onChange={(e) =>
                                            updateBlock(stage.id, block.id, { text: e.target.value })
                                          }
                                          fullWidth
                                          multiline
                                          minRows={3}
                                        />
                                      )}

                                      {block.type === 'practice' && (
                                        <>
                                          <TextField
                                            label="Задание (практика)"
                                            value={block.prompt || ''}
                                            onChange={(e) =>
                                              updateBlock(stage.id, block.id, {
                                                prompt: e.target.value,
                                              })
                                            }
                                            fullWidth
                                            multiline
                                            minRows={3}
                                          />
                                          <TextField
                                            label="Подсказка (если нужно)"
                                            value={block.hint || ''}
                                            onChange={(e) =>
                                              updateBlock(stage.id, block.id, {
                                                hint: e.target.value,
                                              })
                                            }
                                            fullWidth
                                          />
                                        </>
                                      )}

                                      {block.type === 'test' && (
                                        <>
                                          <TextField
                                            label="Вопрос"
                                            value={block.question || ''}
                                            onChange={(e) =>
                                              updateBlock(stage.id, block.id, {
                                                question: e.target.value,
                                              })
                                            }
                                            fullWidth
                                            multiline
                                            minRows={2}
                                          />
                                          <TextField
                                            label="Варианты ответов (каждая строка = вариант)"
                                            value={block.optionsText || ''}
                                            onChange={(e) =>
                                              updateBlock(stage.id, block.id, {
                                                optionsText: e.target.value,
                                              })
                                            }
                                            fullWidth
                                            multiline
                                            minRows={4}
                                          />
                                          <TextField
                                            label="Номер правильного варианта (начиная с 1)"
                                            value={String((block.correctIndex ?? 0) + 1)}
                                            onChange={(e) => {
                                              const n = Number(e.target.value)
                                              const idx = Number.isFinite(n) ? Math.max(1, n) - 1 : 0
                                              updateBlock(stage.id, block.id, { correctIndex: idx })
                                            }}
                                            fullWidth
                                          />
                                          <TextField
                                            label="Подсказка при неверном ответе (опционально)"
                                            value={block.wrongHint || ''}
                                            onChange={(e) =>
                                              updateBlock(stage.id, block.id, {
                                                wrongHint: e.target.value,
                                              })
                                            }
                                            fullWidth
                                          />
                                        </>
                                      )}

                                      {(block.type === 'image' || block.type === 'video') && (
                                        <Stack spacing={1}>
                                          <Button variant="outlined" component="label">
                                            Выбрать файл
                                            <input
                                              type="file"
                                              hidden
                                              accept={
                                                block.type === 'image' ? 'image/*' : 'video/*'
                                              }
                                              onChange={async (e) => {
                                                const file = e.target.files?.[0]
                                                if (!file) return
                                                try {
                                                  await attachFile({
                                                    stageId: stage.id,
                                                    blockId: block.id,
                                                    file,
                                                    kind: block.type,
                                                  })
                                                } catch (err) {
                                                  setError(
                                                    err?.message || 'Не удалось прикрепить файл.',
                                                  )
                                                }
                                              }}
                                            />
                                          </Button>
                                          {block.src ? (
                                            block.type === 'image' ? (
                                              <Box
                                                component="img"
                                                src={block.src}
                                                alt={block.name || ''}
                                                sx={{
                                                  width: '100%',
                                                  maxWidth: 720,
                                                  maxHeight: 320,
                                                  objectFit: 'contain',
                                                  borderRadius: 2,
                                                  border: (t) => `1px solid ${t.palette.divider}`,
                                                  bgcolor: 'background.default',
                                                  mx: 'auto',
                                                  display: 'block',
                                                }}
                                              />
                                            ) : (
                                              <Box
                                                component="video"
                                                src={block.src}
                                                controls
                                                sx={{
                                                  width: '100%',
                                                  maxWidth: 860,
                                                  maxHeight: 360,
                                                  borderRadius: 2,
                                                  border: (t) => `1px solid ${t.palette.divider}`,
                                                  bgcolor: 'background.default',
                                                  mx: 'auto',
                                                  display: 'block',
                                                }}
                                              />
                                            )
                                          ) : (
                                            <Typography variant="body2" color="text.secondary">
                                              Файл не выбран.
                                            </Typography>
                                          )}
                                        </Stack>
                                      )}
                                    </Stack>
                                  </CardContent>
                                </Card>
                              ))}

                              {(stage.blocks || []).length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                  В этапе пока нет блоков — добавьте текст/картинку/видео/практику/тест.
                                </Typography>
                              )}
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    )
                  })()}
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" onClick={onCancel}>
                  Отмена
                </Button>
                <Button type="submit" variant="contained">
                  {submitLabel}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}

