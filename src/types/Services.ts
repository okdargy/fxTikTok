export interface ServiceTikTokResponse {
    success: boolean;
    data:    AwemeList;
}

export interface TikTokAPIResponse {
    status_code:    number;
    min_cursor:     number;
    max_cursor:     number;
    has_more:       number;
    aweme_list:     AwemeList[];
    home_model:     number;
    refresh_clear:  number;
    extra:          ExtraClass;
    log_pb:         LogPb;
    preload_ads:    any[];
    preload_awemes: null;
    log_info:       TikTokAPIResponseLogInfo;
}

export interface AwemeList {
    aweme_id:                        string;
    desc:                            string;
    create_time:                     number;
    author:                          AwemeListAuthor;
    music:                           AddedSoundMusicInfo;
    cha_list:                        ChaList[] | null;
    video:                           Video;
    share_url:                       string;
    user_digged:                     number;
    statistics:                      Statistics;
    status:                          Status;
    rate:                            number;
    text_extra:                      Extra[];
    is_top:                          number;
    label_top:                       LabelTop;
    share_info:                      ChaListShareInfo;
    distance:                        string;
    video_labels:                    any[];
    is_vr:                           boolean;
    is_ads:                          boolean;
    duration:                        number;
    aweme_type:                      number;
    cmt_swt:                         boolean;
    image_infos:                     null;
    risk_infos:                      RiskInfos;
    is_relieve:                      boolean;
    sort_label:                      string;
    position:                        null;
    uniqid_position:                 null;
    author_user_id:                  number;
    bodydance_score:                 number;
    geofencing:                      any[];
    is_hash_tag:                     number;
    is_pgcshow:                      boolean;
    region:                          string;
    video_text:                      any[];
    collect_stat:                    number;
    label_top_text:                  null;
    group_id:                        string;
    prevent_download:                boolean;
    nickname_position:               null;
    challenge_position:              null;
    item_comment_settings:           number;
    with_promotional_music:          boolean;
    long_video:                      null;
    item_duet:                       number;
    item_react:                      number;
    desc_language:                   string;
    interaction_stickers:            InteractionSticker[] | null;
    misc_info:                       string;
    origin_comment_ids:              null;
    commerce_config_data:            null;
    distribute_type:                 number;
    video_control:                   VideoControl;
    commerce_info:                   CommerceInfo;
    anchors:                         null;
    hybrid_label:                    null;
    with_survey:                     boolean;
    geofencing_regions:              null;
    cover_labels:                    null;
    mask_infos:                      any[];
    search_highlight:                null;
    playlist_blocked:                boolean;
    green_screen_materials:          null;
    interact_permission:             InteractPermission;
    question_list:                   null;
    interaction_tag_info?:           InteractionTagInfo;
    content_desc:                    string;
    content_desc_extra:              Extra[];
    products_info:                   null;
    follow_up_publish_from_id:       number;
    disable_search_trending_bar:     boolean;
    image_post_info?:                 ImagePostInfo;
    music_begin_time_in_ms:          number;
    music_end_time_in_ms?:           number;
    item_distribute_source:          string;
    item_source_category:            number;
    branded_content_accounts:        null;
    is_description_translatable:     boolean;
    follow_up_item_id_groups:        string;
    is_text_sticker_translatable:    boolean;
    text_sticker_major_lang:         string;
    original_client_text:            OriginalClientText;
    music_selected_from:             string;
    tts_voice_ids:                   null;
    reference_tts_voice_ids:         null;
    voice_filter_ids:                null;
    reference_voice_filter_ids:      null;
    music_title_style:               number;
    animated_image_info:             AnimatedImageInfo;
    comment_config:                  CommentConfig;
    added_sound_music_info:          AddedSoundMusicInfo;
    origin_volume:                   string;
    music_volume:                    string;
    support_danmaku:                 boolean;
    has_danmaku:                     boolean;
    muf_comment_info_v2:             null;
    behind_the_song_music_ids:       null;
    behind_the_song_video_music_ids: null;
    content_original_type:           number;
    shoot_tab_name?:                 string;
    content_type?:                   string;
    content_size_type?:              number;
    operator_boost_info:             null;
    log_info:                        AwemeListLogInfo;
    main_arch_common:                string;
    aigc_info:                       AigcInfo;
    banners:                         null;
    picked_users:                    null;
    comment_topbar_info:             null;
    batch_index?:                    number;
}

export interface AddedSoundMusicInfo {
    id:                       number;
    id_str:                   string;
    title:                    string;
    author:                   string;
    album:                    string;
    cover_large:              LabelTop;
    cover_medium:             LabelTop;
    cover_thumb:              LabelTop;
    play_url:                 LabelTop;
    source_platform:          number;
    duration:                 number;
    extra:                    string;
    user_count:               number;
    position:                 null;
    collect_stat:             number;
    status:                   number;
    offline_desc:             string;
    owner_id:                 string;
    owner_nickname:           string;
    is_original:              boolean;
    mid:                      string;
    binded_challenge_id:      number;
    author_deleted:           boolean;
    owner_handle:             string;
    author_position:          null;
    prevent_download:         boolean;
    strong_beat_url?:         LabelTop;
    external_song_info:       any[];
    sec_uid:                  string;
    avatar_thumb:             LabelTop;
    avatar_medium:            LabelTop;
    preview_start_time:       number;
    preview_end_time:         number;
    is_commerce_music:        boolean;
    is_original_sound:        boolean;
    artists:                  null;
    lyric_short_position:     null;
    mute_share:               boolean;
    tag_list:                 null;
    is_author_artist:         boolean;
    is_pgc:                   boolean;
    search_highlight:         null;
    multi_bit_rate_play_info: null;
    tt_to_dsp_song_infos:     null;
    recommend_status:         number;
}

export interface LabelTop {
    uri:        string;
    url_list:   string[];
    width:      number;
    height:     number;
    url_prefix: null;
    data_size?: number;
    url_key?:   string;
    file_hash?: string;
}

export interface AigcInfo {
    aigc_label_type: number;
}

export interface AnimatedImageInfo {
    type:   number;
    effect: number;
}

export interface AwemeListAuthor {
    uid:                            string;
    short_id:                       string;
    nickname:                       string;
    signature:                      string;
    avatar_larger:                  LabelTop;
    avatar_thumb:                   LabelTop;
    avatar_medium:                  LabelTop;
    follow_status:                  number;
    aweme_count:                    number;
    following_count:                number;
    follower_count:                 number;
    favoriting_count:               number;
    total_favorited:                number;
    is_block:                       boolean;
    hide_search:                    boolean;
    custom_verify:                  string;
    unique_id:                      string;
    bind_phone:                     string;
    special_lock:                   number;
    need_recommend:                 number;
    has_facebook_token:             boolean;
    has_twitter_token:              boolean;
    fb_expire_time:                 number;
    tw_expire_time:                 number;
    has_youtube_token:              boolean;
    youtube_expire_time:            number;
    room_id:                        number;
    live_verify:                    number;
    authority_status:               number;
    verify_info:                    string;
    shield_follow_notice:           number;
    shield_digg_notice:             number;
    shield_comment_notice:          number;
    share_info:                     AuthorShareInfo;
    with_commerce_entry:            boolean;
    verification_type:              number;
    enterprise_verify_reason:       string;
    is_ad_fake:                     boolean;
    followers_detail:               null;
    region:                         string;
    account_region:                 string;
    commerce_user_level:            number;
    live_agreement:                 number;
    platform_sync_info:             null;
    with_shop_entry:                boolean;
    is_discipline_member:           boolean;
    secret:                         number;
    has_orders:                     boolean;
    prevent_download:               boolean;
    show_image_bubble:              boolean;
    geofencing:                     null;
    unique_id_modify_time:          number;
    video_icon:                     LabelTop;
    ins_id:                         string;
    google_account:                 string;
    youtube_channel_id:             string;
    youtube_channel_title:          string;
    apple_account:                  number;
    is_phone_binded:                boolean;
    accept_private_policy:          boolean;
    twitter_id:                     string;
    twitter_name:                   string;
    user_canceled:                  boolean;
    has_email:                      boolean;
    status:                         number;
    create_time:                    number;
    avatar_uri:                     string;
    follower_status:                number;
    comment_setting:                number;
    duet_setting:                   number;
    user_rate:                      number;
    download_setting:               number;
    download_prompt_ts:             number;
    react_setting:                  number;
    live_commerce:                  boolean;
    cover_url:                      LabelTop[];
    language:                       string;
    has_insights:                   boolean;
    share_qrcode_uri:               string;
    item_list:                      null;
    user_mode:                      number;
    user_period:                    number;
    is_star:                        boolean;
    cv_level:                       string;
    type_label:                     any[];
    ad_cover_url:                   null;
    comment_filter_status:          number;
    avatar_168x168:                 LabelTop;
    avatar_300x300:                 LabelTop;
    relative_users:                 null;
    cha_list:                       null;
    sec_uid:                        string;
    need_points:                    null;
    homepage_bottom_toast:          null;
    can_set_geofencing:             null;
    white_cover_url:                null;
    user_tags:                      null;
    stitch_setting:                 number;
    bold_fields:                    null;
    search_highlight:               null;
    mutual_relation_avatars:        null;
    events:                         null;
    matched_friend:                 MatchedFriend;
    advance_feature_item_order:     null;
    advanced_feature_info:          null;
    user_profile_guide:             null;
    shield_edit_field_info:         null;
    friends_status:                 number;
    can_message_follow_status_list: null;
    account_labels:                 null;
    social_info?:                   string;
}

export interface MatchedFriend {
    video_items: null;
}

export interface AuthorShareInfo {
    share_url:                      string;
    share_weibo_desc:               string;
    share_desc:                     string;
    share_title:                    string;
    share_qrcode_url:               LabelTop;
    share_title_myself:             string;
    share_title_other:              string;
    share_desc_info:                string;
    now_invitation_card_image_urls: null;
}

export interface ChaList {
    cid:              string;
    cha_name:         string;
    desc:             string;
    schema:           string;
    author:           ChaListAuthor;
    user_count:       number;
    share_info:       ChaListShareInfo;
    connect_music:    any[];
    type:             number;
    sub_type:         number;
    is_pgcshow:       boolean;
    collect_stat:     number;
    is_challenge:     number;
    view_count:       number;
    is_commerce:      boolean;
    hashtag_profile:  string;
    cha_attrs:        null;
    banner_list:      null;
    show_items:       null;
    search_highlight: null;
}

export interface ChaListAuthor {
    followers_detail:               null;
    platform_sync_info:             null;
    geofencing:                     null;
    cover_url:                      null;
    item_list:                      null;
    type_label:                     null;
    ad_cover_url:                   null;
    relative_users:                 null;
    cha_list:                       null;
    need_points:                    null;
    homepage_bottom_toast:          null;
    can_set_geofencing:             null;
    white_cover_url:                null;
    user_tags:                      null;
    bold_fields:                    null;
    search_highlight:               null;
    mutual_relation_avatars:        null;
    events:                         null;
    advance_feature_item_order:     null;
    advanced_feature_info:          null;
    user_profile_guide:             null;
    shield_edit_field_info:         null;
    can_message_follow_status_list: null;
    account_labels:                 null;
}

export interface ChaListShareInfo {
    share_url:                       string;
    share_weibo_desc:                string;
    share_desc:                      string;
    share_title:                     string;
    bool_persist:                    number;
    share_title_myself:              string;
    share_title_other:               string;
    share_signature_url:             string;
    share_signature_desc:            string;
    share_quote:                     string;
    share_desc_info:                 string;
    now_invitation_card_image_urls:  null;
    share_link_desc?:                string;
    share_button_display_mode?:      number;
    button_display_stratege_source?: string;
}

export interface CommentConfig {
    emoji_recommend_list: null;
}

export interface CommerceInfo {
    adv_promotable:       boolean;
    branded_content_type: number;
}

export interface Extra {
    start:        number;
    end:          number;
    type:         number;
    hashtag_name: string;
    hashtag_id:   string;
    is_commerce:  boolean;
    line_idx?:    number;
    user_id?:     string;
    sec_uid?:     string;
}

export interface InteractPermission {
    duet:                   number;
    stitch:                 number;
    duet_privacy_setting:   number;
    stitch_privacy_setting: number;
    upvote:                 number;
    allow_adding_to_story:  number;
    allow_create_sticker:   AllowCreateSticker;
}

export interface AllowCreateSticker {
    status: number;
}

export interface InteractionSticker {
    type:              number;
    index:             number;
    track_info:        string;
    attr:              string;
    text_info:         string;
    text_sticker_info: TextStickerInfo;
}

export interface TextStickerInfo {
    text_size:     number;
    text_color:    string;
    bg_color:      string;
    text_language: string;
    alignment:     number;
    source_width:  number;
    source_height: number;
}

export interface InteractionTagInfo {
    interest_level:   number;
    video_label_text: string;
    tagged_users:     TaggedUser[];
}

export interface TaggedUser {
    uid:                 string;
    unique_id:           string;
    nickname:            string;
    avatar_168x168:      LabelTop;
    avatar_thumb:        LabelTop;
    follow_status:       number;
    follower_status:     number;
    interest_level:      number;
    is_business_account: boolean;
    invitation_status:   number;
}

export interface AwemeListLogInfo {
    order: string;
}

export interface OriginalClientText {
    markup_text: string;
    text_extra:  TextExtra[] | null;
}

export interface TextExtra {
    type:         number;
    hashtag_name: string;
    is_commerce?: boolean;
    sub_type?:    number;
    tag_id:       string;
    user_id?:     string;
}

export interface RiskInfos {
    vote:      boolean;
    warn:      boolean;
    risk_sink: boolean;
    type:      number;
    content:   string;
}

export interface Statistics {
    aweme_id:             string;
    comment_count:        number;
    digg_count:           number;
    download_count:       number;
    play_count:           number;
    share_count:          number;
    forward_count:        number;
    lose_count:           number;
    lose_comment_count:   number;
    whatsapp_share_count: number;
    collect_count:        number;
}

export interface Status {
    aweme_id:        string;
    is_delete:       boolean;
    allow_share:     boolean;
    allow_comment:   boolean;
    is_private:      boolean;
    with_goods:      boolean;
    private_status:  number;
    in_reviewing:    boolean;
    reviewed:        number;
    self_see:        boolean;
    is_prohibited:   boolean;
    download_status: number;
}

export interface Video {
    play_addr:                     LabelTop;
    cover:                         LabelTop;
    height:                        number;
    width:                         number;
    dynamic_cover:                 LabelTop;
    origin_cover:                  LabelTop;
    ratio:                         string;
    download_addr:                 LabelTop;
    has_watermark:                 boolean;
    bit_rate:                      BitRate[];
    duration:                      number;
    download_suffix_logo_addr:     LabelTop;
    has_download_suffix_logo_addr: boolean;
    is_h265:                       number;
    cdn_url_expired:               number;
    need_set_token:                boolean;
    CoverTsp:                      number;
    misc_download_addrs:           string;
    tags:                          null;
    big_thumbs:                    null;
    is_bytevc1:                    number;
    meta:                          string;
    source_HDR_type:               number;
    bit_rate_audio:                any[];
    cover_is_custom?:              boolean;
}

export interface BitRate {
    gear_name:    GearName;
    quality_type: number;
    bit_rate:     number;
    play_addr:    LabelTop;
    is_h265:      number;
    is_bytevc1:   number;
    dub_infos:    null;
    HDR_type:     string;
    HDR_bit:      string;
}

export enum GearName {
    Lower540_0 = "lower_540_0",
    Lowest540_0 = "lowest_540_0",
    Normal540_0 = "normal_540_0",
}

export interface VideoControl {
    allow_download:          boolean;
    share_type:              number;
    show_progress_bar:       number;
    draft_progress_bar:      number;
    allow_duet:              boolean;
    allow_react:             boolean;
    prevent_download_type:   number;
    allow_dynamic_wallpaper: boolean;
    timer_status:            number;
    allow_music:             boolean;
    allow_stitch:            boolean;
}

export interface ExtraClass {
    now:            number;
    fatal_item_ids: null;
}

export interface TikTokAPIResponseLogInfo {
    impr_id:   string;
    pull_type: string;
}

export interface LogPb {
    impr_id: string;
}

export interface Image {
    display_image: {
        uri: string;
        url_list: string[];
        width: number;
        height: number;
        url_prefix: string | null;
    }
    owner_watermark_image: {
        uri: string;
        url_list: string[];
        width: number;
        height: number;
        url_prefix: string | null;
    },
    user_watermark_image: {
        uri: string;
        url_list: string[];
        width: number;
        height: number;
        url_prefix: string | null;
    },
    thumbnail: {
        uri: string;
        url_list: string[];
        width: number;
        height: number;
        url_prefix: string | null;
    },
    bitratre_images: string | null
}

export interface ImagePostInfo {
    images: Image[];
    image_post_cover: Image[];
    post_extra: String
}
