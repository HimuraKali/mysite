import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'

export function CourseViewer({
  course,
  showNextButton = true,
  onNextStage,
  readonlyTests = false,
}) {
  const stages = course?.stages || []
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const [testState, setTestState] = useState(() => ({}))

  const activeStage = stages[activeStageIndex] || null
  const nextStage = stages[activeStageIndex + 1] || null

  const header = useMemo(() => {
    return (
      <Stack spacing={1}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          {activeStage?.title || (stages.length ? `Этап ${activeStageIndex + 1}` : '')}
        </Typography>
      </Stack>
    )
  }, [activeStage?.title, activeStageIndex, stages.length])

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
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
            <Typography sx={{ fontWeight: 900, mb: 1 }}>Этапы</Typography>
            <List dense disablePadding sx={{ borderRadius: 2, overflow: 'hidden' }}>
              {stages.map((s, idx) => (
                <ListItemButton
                  key={s.id}
                  selected={idx === activeStageIndex}
                  onClick={() => setActiveStageIndex(idx)}
                >
                  <ListItemText primary={s.title || `Этап ${idx + 1}`} />
                </ListItemButton>
              ))}
            </List>
            {stages.length === 0 && (
              <Typography color="text.secondary">В этом курсе пока нет этапов.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ flex: '1 1 auto', width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
        <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
          <CardContent>
            <Stack spacing={1.5}>
              {header}

              <Stack spacing={1.25}>
                {(activeStage?.blocks || []).map((block) => (
                  <Card
                    key={block.id}
                    elevation={0}
                    sx={{ border: (t) => `1px solid ${t.palette.divider}` }}
                  >
                    <CardContent>
                      {block.type === 'text' && (
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                          {block.text || ''}
                        </Typography>
                      )}

                      {block.type === 'image' && block.src && (
                        <Box
                          component="img"
                          src={block.src}
                          alt={block.name || ''}
                          sx={{
                            width: '100%',
                            maxWidth: 720,
                            maxHeight: 360,
                            objectFit: 'contain',
                            borderRadius: 2,
                            display: 'block',
                            mx: 'auto',
                            bgcolor: 'background.default',
                          }}
                        />
                      )}

                      {block.type === 'video' && block.src && (
                        <Box
                          component="video"
                          src={block.src}
                          controls
                          sx={{
                            width: '100%',
                            maxWidth: 860,
                            maxHeight: 420,
                            borderRadius: 2,
                            display: 'block',
                            mx: 'auto',
                            bgcolor: 'background.default',
                          }}
                        />
                      )}

                      {block.type === 'practice' && (
                        <Stack spacing={1}>
                          <Typography sx={{ fontWeight: 800 }}>Практика</Typography>
                          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                            {block.prompt || ''}
                          </Typography>
                          {block.hint ? (
                            <Typography variant="body2" color="text.secondary">
                              Подсказка: {block.hint}
                            </Typography>
                          ) : null}
                        </Stack>
                      )}

                      {block.type === 'test' && (
                        <Stack spacing={1}>
                          <Typography sx={{ fontWeight: 900 }}>Тест</Typography>
                          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                            {block.question || 'Вопрос не задан'}
                          </Typography>

                          {(() => {
                            const options = String(block.optionsText || '')
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean)
                            const state = testState[block.id] || {}
                            const selected = state.selected ?? ''
                            const submitted = Boolean(state.submitted)
                            const isCorrect =
                              submitted && Number(state.selected) === Number(block.correctIndex)

                            return (
                              <Stack spacing={1}>
                                <RadioGroup
                                  value={selected}
                                  onChange={(e) => {
                                    if (readonlyTests) return
                                    const value = e.target.value
                                    setTestState((prev) => ({
                                      ...prev,
                                      [block.id]: { ...prev[block.id], selected: value },
                                    }))
                                  }}
                                >
                                  {options.map((opt, idx) => (
                                    <FormControlLabel
                                      key={idx}
                                      value={String(idx)}
                                      control={<Radio />}
                                      label={opt}
                                      disabled={readonlyTests}
                                    />
                                  ))}
                                </RadioGroup>

                                {!readonlyTests && (
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Button
                                      variant="contained"
                                      onClick={() => {
                                        setTestState((prev) => ({
                                          ...prev,
                                          [block.id]: { ...prev[block.id], submitted: true },
                                        }))
                                      }}
                                      disabled={selected === ''}
                                    >
                                      Проверить
                                    </Button>
                                    {submitted && (
                                      <Typography
                                        color={isCorrect ? 'success.main' : 'error.main'}
                                        sx={{ fontWeight: 800 }}
                                      >
                                        {isCorrect ? 'Верно' : 'Неверно'}
                                      </Typography>
                                    )}
                                  </Stack>
                                )}

                                {submitted && !isCorrect && block.wrongHint ? (
                                  <Typography variant="body2" color="text.secondary">
                                    Подсказка: {block.wrongHint}
                                  </Typography>
                                ) : null}
                              </Stack>
                            )
                          })()}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {(activeStage?.blocks || []).length === 0 && (
                  <Typography color="text.secondary">В этом этапе пока нет блоков.</Typography>
                )}
              </Stack>

              {showNextButton && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Этап {Math.min(activeStageIndex + 1, stages.length)} из {stages.length || 0}
                    </Typography>
                    <Button
                      variant="contained"
                      disabled={!nextStage}
                      onClick={() => {
                        const nextIdx = Math.min(activeStageIndex + 1, stages.length - 1)
                        setActiveStageIndex(nextIdx)
                        onNextStage?.(nextIdx)
                      }}
                    >
                      {nextStage
                        ? `Перейти к: ${nextStage.title || 'следующий этап'}`
                        : 'Курс завершён'}
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  )
}

