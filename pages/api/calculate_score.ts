import NextCors from "nextjs-cors"

import { supabase } from "./utils/supabase"

const fetch_score = async (req: any, res: any) => {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    origin: "*", // Allow all origins
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
  const { user_id } = req.body
  const { data: dapp_users } = await supabase
    .from("dapp_users")
    .select("*,users:user_id(*),dapps:dapp_id(*)")
    .match({
      user_id,
    })
  const { error, data: stampData } = await supabase
    .from("dapp_stamptypes")
    .select("*,stamptypes:stamptype_id(*)")
    .match({
      dapp_id: dapp_users?.[0]?.dapp_id,
    })
  const { data: scoreData } = await supabase
    .from("stampscore_dapps")
    .select("*,stampscore_schemas:schema_id(*)")
    .match({
      dapp_id: dapp_users?.[0]?.dapp_id,
    })
  const { data: stampScores } = await supabase
    .from("stampscores_available")
    .select("*")
    .match({
      schema_id: scoreData?.[0]?.schema_id,
    })

  const { data: stampsList } = await supabase.from("stamps").select("*").match({
    created_by_user_id: dapp_users?.[0]?.user_id,
  })

  const stampsToSend = stampData ?? []

  const allStampIds = (stampsList ?? []).map((item: any) => item.stamptype)

  const stampScore = [
    ...stampsToSend.filter((item) =>
      allStampIds?.includes(item?.stamptypes?.id)
    ),
  ].reduce((curr, item) => {
    const scoreData = (stampScores ?? []).find(
      (_) => _.stamptype_id === item.stamptype_id
    )
    const scoreToAdd = scoreData?.score ?? 0
    return scoreToAdd + curr
  }, 0)
  res.send(stampScore)
}

export default fetch_score
